import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Database,
  Download,
  ExternalLink,
  Github,
  Globe,
  Scale,
  Tag as TagIcon,
  Wrench,
} from "lucide-react";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import {
  formatDate,
  parseJsonArray,
  parseStringList,
  type Reference,
  type SupportingFile,
} from "@/lib/content";
import { personId, siteUrl, buildBreadcrumbSchema, JsonLdScript } from "@/lib/seo";
import { Prose } from "@/components/synkra/Prose";
import { Chip, DataNotice, EmptyState, SectionHeading, StatusBadge } from "@/components/synkra/bento";
import { Reveal } from "@/components/synkra/Reveal";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

async function getProject(slug: string) {
  return db.project.findUnique({
    where: { slug },
    include: { category: true, coverImage: true, tags: true },
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project || project.status !== "published") {
    return { title: "Project not found", robots: { index: false, follow: false } };
  }
  const title = project.metaTitle || project.title;
  const description = project.metaDescription || project.summary.slice(0, 160);
  const coverUrl = project.coverImage ? `/api/media/${project.coverImage.id}` : "/og.png";
  return {
    title,
    description,
    keywords: parseStringList(project.tools),
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/projects/${project.slug}`,
      publishedTime: project.publishedAt?.toISOString(),
      modifiedTime: project.updatedAt.toISOString(),
      images: [{ url: coverUrl, alt: project.coverImage?.altText || `Cover image for ${project.title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverUrl],
    },
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section className="bento p-5 sm:p-7">
        <h2 className="text-base font-black tracking-tight text-[#15161A] sm:text-lg">{title}</h2>
        <div className="mt-3">{children}</div>
      </section>
    </Reveal>
  );
}

function BulletsFromText({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return <p className="text-[13px] leading-relaxed text-gray-600 sm:text-sm">{text}</p>;
  return (
    <ul className="space-y-1.5">
      {lines.map((line, i) => (
        <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-gray-600 sm:text-sm">
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#D6F824] ring-1 ring-black/10" aria-hidden />
          <span>{line.replace(/^[-•*]\s*/, "")}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = await getProject(slug);
  const admin = await isAdmin();

  // Drafts/archived are invisible to the public; admins can preview with a banner.
  if (!project || (project.status !== "published" && !admin)) notFound();
  if (!project) notFound();

  const isDraftView = project.status !== "published";
  const tools = parseStringList(project.tools);
  const sourceUrls = parseJsonArray<Reference>(project.datasetSourceUrls);
  const references = parseJsonArray<Reference>(project.references);
  const supportingFileIds = parseJsonArray<string>(project.supportingFiles);
  const relatedIds = parseJsonArray<string>(project.relatedProjectIds);

  const [supportingAssets, relatedRaw] = await Promise.all([
    supportingFileIds.length
      ? db.mediaAsset.findMany({ where: { id: { in: supportingFileIds } } })
      : Promise.resolve([]),
    project.categoryId
      ? db.project.findMany({
          where: { status: "published", categoryId: project.categoryId, id: { not: project.id } },
          take: 3,
          orderBy: { publishedAt: "desc" },
          include: { category: true },
        })
      : Promise.resolve([]),
  ]);

  // Only link to published related projects that were explicitly chosen or same-category
  const explicitRelated = relatedIds.length
    ? await db.project.findMany({
        where: { id: { in: relatedIds }, status: "published" },
        include: { category: true },
      })
    : [];
  const relatedProjects = explicitRelated.length ? explicitRelated : relatedRaw;

  const projectUrl = `${siteUrl()}/projects/${project.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${projectUrl}#work`,
        name: project.title,
        url: projectUrl,
        description: project.summary,
        inLanguage: "en-ZA",
        isAccessibleForFree: true,
        author: { "@id": personId() },
        ...(project.publishedAt ? { datePublished: project.publishedAt.toISOString() } : {}),
        dateModified: project.updatedAt.toISOString(),
        ...(tools.length ? { keywords: tools.join(", ") } : {}),
        ...(project.category ? { genre: project.category.name } : {}),
        ...(project.coverImage ? { image: `${siteUrl()}/api/media/${project.coverImage.id}` } : {}),
        mainEntityOfPage: { "@type": "WebPage", "@id": projectUrl },
      },
      buildBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Projects", url: "/projects" },
        { name: project.title, url: `/projects/${project.slug}` },
      ]),
    ],
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <JsonLdScript data={jsonLd} />

      {isDraftView && (
        <div className="rounded-2xl border border-black/5 bg-[#FDE6D2] px-4 py-3 text-xs font-bold text-[#5c3a1e]" role="status">
          Draft preview — this page is only visible to you (admin) and is marked noindex. Status: {project.status}.
        </div>
      )}

      <Reveal>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#15161A] shadow-sm border border-black/5 transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to projects
        </Link>
      </Reveal>

      {/* ── Header card ── */}
      <Reveal>
        <header className="bento bento-lg overflow-hidden">
          {project.coverImage && (
            <div className="aspect-[21/9] w-full overflow-hidden bg-[#F4F3F0]">
              { }
              <img
                src={`/api/media/${project.coverImage.id}`}
                alt={project.coverImage.altText || `Cover image for ${project.title}`}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-1.5">
              {project.category && <Chip tone="lime">{project.category.name}</Chip>}
              {project.projectType && <Chip tone="bone">{project.projectType}</Chip>}
              {project.statusLabel && <Chip tone="sky">{project.statusLabel}</Chip>}
              {isDraftView && <StatusBadge status={project.status} />}
            </div>
            <h1 className="mt-4 text-2xl font-black leading-tight tracking-tight text-[#15161A] sm:text-4xl">{project.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">{project.summary}</p>
            <p className="mt-4 text-[11px] font-medium text-gray-400">
              {project.publishedAt && <>Published {formatDate(project.publishedAt)} · </>}
              Last updated {formatDate(project.updatedAt)}
            </p>
          </div>
        </header>
      </Reveal>

      {project.dataNotice && (
        <Reveal><DataNotice notice={project.dataNotice} /></Reveal>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Main narrative column ── */}
        <div className="space-y-5">
          {project.researchQuestion && (
            <Section title="Research question">
              <blockquote className="rounded-2xl bg-[#15161A] p-5 text-sm font-semibold leading-relaxed text-white sm:text-base">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#D6F824]">The question</span>
                {project.researchQuestion}
              </blockquote>
            </Section>
          )}

          {project.context && (
            <Section title="Context & objective">
              <Prose content={project.context} />
            </Section>
          )}

          {project.methodology && (
            <Section title="Methodology & assumptions">
              <Prose content={project.methodology} />
            </Section>
          )}

          {project.body && (
            <Section title="Analysis">
              <Prose content={project.body} />
            </Section>
          )}

          {project.findings && (
            <Section title="Results & findings">
              <BulletsFromText text={project.findings} />
            </Section>
          )}

          {project.recommendations && (
            <Section title="Recommendations & implications">
              <Prose content={project.recommendations} />
            </Section>
          )}

          {project.limitations && (
            <Section title="Limitations & uncertainty">
              <Prose content={project.limitations} />
            </Section>
          )}

          {project.lessons && (
            <Section title="What I learned & next steps">
              <Prose content={project.lessons} />
            </Section>
          )}

          {references.length > 0 && (
            <Section title="References">
              <ol className="space-y-2">
                {references.map((ref, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-gray-600 sm:text-sm">
                    <span className="font-bold text-[#15161A]">[{i + 1}]</span>
                    <span>
                      {ref.url ? (
                        <a href={ref.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#15161A] underline underline-offset-2 break-words">
                          {ref.text}
                        </a>
                      ) : (
                        ref.text
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {supportingAssets.length > 0 && (
            <Section title="Supporting files">
              <ul className="space-y-2">
                {supportingAssets.map((f) => (
                  <li key={f.id}>
                    <a
                      href={`/api/media/${f.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-[#F4F3F0] px-4 py-3 text-xs font-bold text-[#15161A] transition-all hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Download className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                        <span className="truncate">{f.caption || f.originalFilename}</span>
                      </span>
                      <span className="shrink-0 text-[10px] font-semibold text-gray-400">
                        {(f.fileSizeBytes / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        {/* ── Meta sidebar ── */}
        <Reveal className="lg:sticky lg:top-24 lg:self-start">
          <aside className="space-y-4" aria-label="Project metadata">
            <div className="bento space-y-4 p-5">
              {tools.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <Wrench className="h-3 w-3" aria-hidden /> Tools & methods
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tools.map((t) => <Chip key={t} tone="bone">{t}</Chip>)}
                  </div>
                </div>
              )}
              {project.projectDate && (
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <CalendarDays className="h-3 w-3" aria-hidden /> Completed
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#15161A]">{project.projectDate}</p>
                </div>
              )}
              {(project.dataPeriod || project.geographicCoverage) && (
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <Database className="h-3 w-3" aria-hidden /> Data coverage
                  </p>
                  {project.dataPeriod && <p className="mt-1 text-xs font-semibold text-[#15161A]">{project.dataPeriod}</p>}
                  {project.geographicCoverage && <p className="mt-0.5 text-xs text-gray-500">{project.geographicCoverage}</p>}
                </div>
              )}
              {project.tags.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <TagIcon className="h-3 w-3" aria-hidden /> Tags
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {project.tags.map((t) => <Chip key={t.id} tone="sky">{t.name}</Chip>)}
                  </div>
                </div>
              )}
            </div>

            {(project.repositoryUrl || project.dashboardUrl || sourceUrls.length > 0 || project.licenceNotes) && (
              <div className="bento space-y-2.5 p-5">
                {project.repositoryUrl && (
                  <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-2xl bg-[#15161A] px-4 py-3 text-xs font-bold text-white transition-transform hover:-translate-y-0.5">
                    <span className="flex items-center gap-2.5"><Github className="h-4 w-4" aria-hidden /> Code repository</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden />
                  </a>
                )}
                {project.dashboardUrl && (
                  <a href={project.dashboardUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-2xl bg-[#D6F824] px-4 py-3 text-xs font-bold text-[#141C00] transition-transform hover:-translate-y-0.5">
                    <span className="flex items-center gap-2.5"><Globe className="h-4 w-4" aria-hidden /> View live dashboard</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </a>
                )}
                {sourceUrls.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Data sources</p>
                    <ul className="mt-1.5 space-y-1">
                      {sourceUrls.map((s, i) => (
                        <li key={i}>
                          <a href={s.url} target="_blank" rel="noopener noreferrer" className="break-words text-xs font-semibold text-[#15161A] underline underline-offset-2">
                            {s.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {project.licenceNotes && (
                  <div className="flex items-start gap-2 border-t border-black/5 pt-2.5">
                    <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                    <p className="text-[11px] leading-relaxed text-gray-500">{project.licenceNotes}</p>
                  </div>
                )}
              </div>
            )}

            {project.dataCleaningNotes && (
              <div className="bento p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Data quality & cleaning</p>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{project.dataCleaningNotes}</p>
              </div>
            )}
          </aside>
        </Reveal>
      </div>

      {/* ── Related projects ── */}
      {relatedProjects.length > 0 && (
        <section aria-label="Related projects" className="pt-4">
          <Reveal>
            <SectionHeading title="Related projects" />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedProjects.map((rp, idx) => (
              <Reveal key={rp.id} delay={0.05 * idx}>
                <Link href={`/projects/${rp.slug}`} className="bento bento-hover group block h-full p-5">
                  {rp.category && <Chip tone="lime">{rp.category.name}</Chip>}
                  <h3 className="mt-2.5 text-sm font-bold leading-snug text-[#15161A]">{rp.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">{rp.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 transition-colors group-hover:text-[#15161A]">
                    Open project <ArrowUpRight className="h-3 w-3" aria-hidden />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
