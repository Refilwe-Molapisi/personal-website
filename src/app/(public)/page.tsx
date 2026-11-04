import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  ExternalLink,
  LineChart,
  Linkedin,
  SearchCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { parseStringList, formatDate } from "@/lib/content";
import { buildProfilePageSchema, buildBreadcrumbSchema, JsonLdScript } from "@/lib/seo";
import { ArticleCard, EmptyState, ProjectCard, SectionHeading } from "@/components/synkra/bento";
import { Reveal } from "@/components/synkra/Reveal";

export const revalidate = 60;

const FOCUS_AREAS = [
  {
    icon: BarChart3,
    title: "Business Intelligence",
    text: "Dashboards and reporting that turn operational data into decisions — data modelling, measures and clear visuals.",
  },
  {
    icon: SearchCheck,
    title: "Commercial & Market Analysis",
    text: "Framing commercial questions, analysing markets and consumers, and communicating what the numbers mean.",
  },
  {
    icon: LineChart,
    title: "Economic Analysis & Research",
    text: "Applying statistics and econometrics to economic questions, with honest treatment of assumptions and limits.",
  },
];

export default async function HomePage() {
  const settings = await getSiteSettings();

  // Content queries are fault-tolerant: if the database is briefly
  // unavailable (cold start, deploy, migration) the page still renders with
  // its empty states instead of erroring.
  let featuredProjects: Awaited<ReturnType<typeof db.project.findMany>> = [];
  let recentArticles: Awaited<ReturnType<typeof db.researchArticle.findMany>> = [];
  let skills: Awaited<ReturnType<typeof db.skill.findMany>> = [];
  try {
    [featuredProjects, recentArticles, skills] = await Promise.all([
      db.project.findMany({
        where: { status: "published", isFeatured: true },
        orderBy: [{ displayOrder: "asc" }, { publishedAt: "desc" }],
        take: 3,
        include: { category: true, coverImage: true },
      }),
      db.researchArticle.findMany({
        where: { status: "published" },
        orderBy: [{ publishedAt: "desc" }],
        take: 2,
        include: { topic: true, coverImage: true },
      }),
      db.skill.findMany({ where: { isVisible: true }, orderBy: [{ displayOrder: "asc" }], take: 6 }),
    ]);
  } catch {
    // Database not ready — render empty states.
  }

  const intro = settings?.homeIntro || settings?.intro || "";
  const linkedinUrl = settings?.linkedinUrl || "";

  return (
    <div className="mx-auto max-w-6xl space-y-12 md:space-y-16">
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@graph": [
            buildProfilePageSchema(settings),
            buildBreadcrumbSchema([{ name: "Home", url: "/" }]),
          ],
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <Reveal>
        <section
          aria-label="Introduction"
          className="bento bento-lg relative overflow-hidden bg-[#15161A] p-6 text-white sm:p-10 anim-hero"
        >
          {/* Soft decorative glow (hidden from AT; static under reduced motion) */}
          <span
            aria-hidden
            className="anim-hero-glow pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#D6F824]/10 blur-3xl"
          />
          <span className="anim-fade-up relative inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D6F824] sm:text-[11px]">
            <Sparkles className="h-3 w-3" aria-hidden />
            {settings?.headline || "Final-year BCom Economics student"}
          </span>
          <h1 className="anim-fade-up anim-delay-1 relative mt-5 text-3xl font-black leading-[1.08] tracking-tight sm:text-5xl">
            {settings?.displayName || "Refilwe Molapisi"}
            <span className="block text-white/50">Analytics portfolio</span>
          </h1>
          <p className="anim-fade-up anim-delay-2 relative mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">{intro}</p>
          <div className="anim-fade-up anim-delay-3 relative mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-[#D6F824] px-5 py-2.5 text-sm font-bold text-[#141C00] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
            >
              View projects <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            {linkedinUrl ? (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10 active:scale-95"
              >
                <Linkedin className="h-4 w-4" aria-hidden /> Connect on LinkedIn
              </a>
            ) : (
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10 active:scale-95"
              >
                More about me <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
          </div>
        </section>
      </Reveal>

      {/* ── Focus areas ──────────────────────────────────────── */}
      <section aria-label="Focus areas">
        <Reveal>
          <SectionHeading title="What I do" sub="The analytical work you will find on this site, and the roles I am working towards from 2027." />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3">
          {FOCUS_AREAS.map((area, idx) => (
            <Reveal key={area.title} delay={0.06 * (idx + 1)}>
              <div className="bento bento-hover h-full p-5 sm:p-6">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#15161A]">
                  <area.icon className="h-5 w-5 text-[#D6F824]" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-bold tracking-tight text-[#15161A]">{area.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">{area.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Selected projects ────────────────────────────────── */}
      <section aria-label="Selected projects">
        <Reveal>
          <SectionHeading
            title="Selected projects"
            sub="End-to-end analytical work: the question, the data, the method, the findings and the limitations."
            action={
              <Link href="/projects" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#15161A] shadow-sm border border-black/5 transition-all hover:-translate-y-0.5 active:scale-95">
                All projects <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            }
          />
        </Reveal>
        {featuredProjects.length === 0 ? (
          <EmptyState
            title="Projects coming soon"
            message="Featured analytical projects will appear here as they are published. Check back soon, or explore the rest of the site meanwhile."
            action={<Link href="/research" className="text-xs font-bold text-[#15161A] underline underline-offset-4">Read the research instead</Link>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((p, idx) => (
              <Reveal key={p.id} delay={0.05 * idx}>
                <ProjectCard
                  project={{
                    slug: p.slug,
                    title: p.title,
                    summary: p.summary,
                    tools: parseStringList(p.tools),
                    categoryName: p.category?.name,
                    coverUrl: p.coverImage ? `/api/media/${p.coverImage.id}` : null,
                    coverAlt: p.coverImage?.altText ?? null,
                    projectType: p.projectType,
                    dateLabel: p.projectDate,
                  }}
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ── Research & insights ──────────────────────────────── */}
      <section aria-label="Research and insights">
        <Reveal>
          <SectionHeading
            title="Research & insights"
            sub="Short, honest written work on data, markets and method."
            action={
              <Link href="/research" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#15161A] shadow-sm border border-black/5 transition-all hover:-translate-y-0.5 active:scale-95">
                All research <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            }
          />
        </Reveal>
        {recentArticles.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Research coming soon"
            message="Published research notes and briefs will appear here. Nothing has been published yet."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {recentArticles.map((a, idx) => (
              <Reveal key={a.id} delay={0.05 * idx}>
                <ArticleCard
                  article={{
                    slug: a.slug,
                    title: a.title,
                    summary: a.summary,
                    topicName: a.topic?.name,
                    contentType: a.contentType,
                    publishedLabel: formatDate(a.publishedAt),
                    readingTime: a.readingTimeMinutes,
                  }}
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ── Skills preview ───────────────────────────────────── */}
      <section aria-label="Skills preview">
        <Reveal>
          <SectionHeading
            title="Tools of the trade"
            sub="A snapshot of the toolkit. Proficiency labels are self-assessed and linked to real evidence."
            action={
              <Link href="/skills" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#15161A] shadow-sm border border-black/5 transition-all hover:-translate-y-0.5 active:scale-95">
                <Wrench className="h-3.5 w-3.5" aria-hidden /> All skills
              </Link>
            }
          />
        </Reveal>
        <Reveal>
          <div className="flex flex-wrap gap-2.5">
            {skills.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-xs font-bold text-[#15161A] shadow-sm transition-all hover:-translate-y-0.5">
                {s.name}
                <span className="rounded-full bg-[#F4F3F0] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gray-500">{s.statusLabel}</span>
              </span>
            ))}
            {skills.length === 0 && <p className="text-sm text-gray-500">Skills are being updated — check back soon.</p>}
          </div>
        </Reveal>
      </section>

      {/* ── LinkedIn destination ─────────────────────────────── */}
      {linkedinUrl && (
        <Reveal>
          <section aria-label="LinkedIn">
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bento bento-hover group flex items-center justify-between gap-4 bg-[#15161A] p-6 text-white sm:p-8"
            >
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#D6F824]">
                  <Linkedin className="h-5 w-5 text-[#141C00]" aria-hidden />
                </span>
                <div>
                  <p className="text-base font-bold sm:text-lg">Let&apos;s connect professionally</p>
                  <p className="mt-0.5 text-xs text-white/60 sm:text-sm">My LinkedIn profile is the best place to reach me and see my background.</p>
                </div>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 transition-all group-hover:bg-[#D6F824]">
                <ArrowUpRight className="h-5 w-5 transition-colors group-hover:text-[#141C00]" aria-hidden />
              </span>
            </a>
          </section>
        </Reveal>
      )}

      {/* ── Disclaimer (integrity) ───────────────────────────── */}
      <Reveal>
        <p className="mx-auto max-w-3xl px-2 text-center text-[11px] leading-relaxed text-gray-400">
          Independent and academic work. Project analyses marked as simulated use synthetic data and demonstrate method only — they do not describe real organisations. Nothing on this site constitutes financial, legal or investment advice.
        </p>
      </Reveal>
    </div>
  );
}
