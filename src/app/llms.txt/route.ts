import { getSiteSettings } from "@/lib/settings";
import { siteUrl, displayName, headline } from "@/lib/seo";

/**
 * llms.txt — a markdown guide for AI/LLM crawlers (llmstxt.org convention).
 * Served dynamically so URLs always match the current deployment origin.
 */

export const revalidate = 3600;

export async function GET() {
  const base = siteUrl();
  const settings = await getSiteSettings();
  const name = displayName(settings);

  const body = `# ${name} — Analytics Portfolio

> Professional portfolio of ${name}, ${headline(settings)} (South Africa), publishing end-to-end analytical work: business intelligence dashboards, commercial and market analysis, and economic research. Every project documents its research question, data, method, findings and limitations. She is seeking entry-level analyst opportunities from 2027.

This site is a public professional portfolio. It collects no visitor personal information, runs no advertising and contains no paywalled content.

## Main pages

- [Home](${base}/): Overview of focus areas, featured projects, latest research and skills snapshot.
- [Projects](${base}/projects): Published analytical projects with full documentation — question, data, method, findings, limitations.
- [Skills & Tools](${base}/skills): Honest, self-assessed skill inventory grouped by area.
- [Research & Insights](${base}/research): Research briefs, market commentary, policy analysis, literature reviews and data notes.
- [About](${base}/about): Background, education, career directions, analytical approach and an FAQ.
- [Privacy notice](${base}/privacy): What this site does and does not collect.

## Facts

- Name: ${name}
- Role: ${headline(settings)}
- Education: ${settings?.educationSummary || "BCom Economics (final-year student)"}
- Focus areas: ${(settings?.professionalInterests || "Business intelligence\nCommercial and business analysis\nMarket research and consumer insights\nRisk, compliance and financial crime analysis\nEconomic and policy research")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("; ")}
- Tools: Microsoft Excel, Power BI (DAX), SQL, Python (pandas, matplotlib)
- Contact: via LinkedIn${settings?.linkedinUrl ? ` (${settings.linkedinUrl})` : ""}${settings?.publicEmail ? ` or email ${settings.publicEmail}` : ""}
- Content integrity: work marked "simulated" or "synthetic" uses data generated for demonstration only and describes no real organisation; no content constitutes financial, legal or investment advice

## Optional

- [Full content for LLMs](${base}/llms-full.txt): extended single-file version of this guide, including the About page, FAQ and a catalogue of published work.
- [Sitemap](${base}/sitemap.xml): all indexable URLs.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
