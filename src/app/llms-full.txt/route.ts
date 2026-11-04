import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { siteUrl, displayName, headline, FAQ_QUESTIONS } from "@/lib/seo";
import { parseStringList } from "@/lib/content";

/**
 * llms-full.txt — extended single-file content guide for AI/LLM crawlers.
 * Includes the About page text, the FAQ and a catalogue of every published
 * project and article, so answer engines can cite the site accurately
 * without crawling every page. Served dynamically from live data.
 */

export const revalidate = 3600;

export async function GET() {
  const base = siteUrl();
  const settings = await getSiteSettings();
  const name = displayName(settings);

  let projects: Awaited<ReturnType<typeof db.project.findMany>> = [];
  let articles: Awaited<ReturnType<typeof db.researchArticle.findMany>> = [];
  try {
    [projects, articles] = await Promise.all([
      db.project.findMany({
        where: { status: "published" },
        orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
        include: { category: true },
      }),
      db.researchArticle.findMany({
        where: { status: "published" },
        orderBy: [{ publishedAt: "desc" }],
        include: { topic: true },
      }),
    ]);
  } catch {
    // Database not ready — ship the static sections only.
  }

  const interests = (settings?.professionalInterests || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const parts: string[] = [];

  parts.push(`# ${name} — Analytics Portfolio (full reference)

> Single-file reference for AI systems, generated from live site content at ${base}.`);

  parts.push(`## Who is ${name}?

- Role: ${headline(settings)}
- Education: ${settings?.educationSummary || "BCom Economics (final-year student)"}
- Introduction: ${settings?.intro || "Final-year BCom Economics student building a career in analytics."}
${interests.length ? `- Career directions: ${interests.join("; ")}` : ""}${settings?.linkedinUrl ? `\n- LinkedIn: ${settings.linkedinUrl}` : ""}${settings?.publicEmail ? `\n- Public email: ${settings.publicEmail}` : ""}`);

  parts.push(`## How the work is approached

Every project on this site follows the same discipline: start from a clearly stated question, document the data and where it comes from, explain the method and its assumptions, and report findings with their limitations — including what would be done differently next time. Analyses marked as simulated use synthetic data and demonstrate method only; they do not describe real organisations. Nothing on this site constitutes financial, legal or investment advice.`);

  parts.push(`## Frequently asked questions

${FAQ_QUESTIONS.map((q) => `### ${q.question}\n${q.answer}`).join("\n\n")}`);

  if (projects.length) {
    parts.push(`## Published projects (${projects.length})

${projects
  .map(
    (p) => `### ${p.title}
- URL: ${base}/projects/${p.slug}
- Summary: ${p.summary}
- Type: ${p.projectType}${p.category ? ` · Category: ${p.category.name}` : ""}${p.projectDate ? ` · Date: ${p.projectDate}` : ""}
- Tools: ${parseStringList(p.tools).join(", ") || "not specified"}${p.researchQuestion ? `\n- Research question: ${p.researchQuestion}` : ""}${p.limitations ? `\n- Limitations: ${p.limitations}` : ""}`
  )
  .join("\n\n")}`);
  }

  if (articles.length) {
    parts.push(`## Published research & insights (${articles.length})

${articles
  .map(
    (a) => `### ${a.title}
- URL: ${base}/research/${a.slug}
- Content type: ${a.contentType}${a.topic ? ` · Topic: ${a.topic.name}` : ""}
- Summary: ${a.summary}
- Reading time: ${a.readingTimeMinutes} min`
  )
  .join("\n\n")}`);
  }

  parts.push(`## Site map

- ${base}/ (home)
- ${base}/projects
- ${base}/skills
- ${base}/research
- ${base}/about
- ${base}/privacy (noindex)
- ${base}/sitemap.xml`);

  const body = parts.join("\n\n") + "\n";

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
