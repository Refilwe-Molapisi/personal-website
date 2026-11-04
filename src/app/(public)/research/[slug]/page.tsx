import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpen, Scale, Tag as TagIcon } from "lucide-react";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { formatDate, parseJsonArray, type Reference } from "@/lib/content";
import { personId, siteUrl, buildBreadcrumbSchema, JsonLdScript } from "@/lib/seo";
import { Prose } from "@/components/synkra/Prose";
import { Chip, StatusBadge } from "@/components/synkra/bento";
import { Reveal } from "@/components/synkra/Reveal";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

async function getArticle(slug: string) {
  return db.researchArticle.findUnique({
    where: { slug },
    include: { topic: true, tags: true, coverImage: true },
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article || article.status !== "published") {
    return { title: "Article not found", robots: { index: false, follow: false } };
  }
  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.summary.slice(0, 160);
  const coverUrl = article.coverImage ? `/api/media/${article.coverImage.id}` : "/og.png";
  return {
    title,
    description,
    alternates: { canonical: `/research/${article.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/research/${article.slug}`,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: [{ url: coverUrl, alt: article.coverImage?.altText || `Cover image for ${article.title}` }],
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

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  const admin = await isAdmin();

  if (!article || (article.status !== "published" && !admin)) notFound();

  const isDraftView = article.status !== "published";
  const references = parseJsonArray<Reference>(article.references);

  const related = article.categoryId
    ? await db.researchArticle.findMany({
        where: { status: "published", categoryId: article.categoryId, id: { not: article.id } },
        take: 2,
        orderBy: { publishedAt: "desc" },
        include: { topic: true },
      })
    : [];

  const articleUrl = `${siteUrl()}/research/${article.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${articleUrl}#article`,
        headline: article.title,
        description: article.summary,
        url: articleUrl,
        inLanguage: "en-ZA",
        isAccessibleForFree: true,
        author: { "@id": personId() },
        ...(article.publishedAt ? { datePublished: article.publishedAt.toISOString() } : {}),
        dateModified: article.updatedAt.toISOString(),
        ...(article.topic ? { articleSection: article.topic.name } : {}),
        ...(article.tags.length ? { keywords: article.tags.map((t) => t.name).join(", ") } : {}),
        ...(article.coverImage ? { image: `${siteUrl()}/api/media/${article.coverImage.id}` } : {}),
        mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
        wordCount: article.body.trim() ? article.body.trim().split(/\s+/).length : undefined,
      },
      buildBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Research & Insights", url: "/research" },
        { name: article.title, url: `/research/${article.slug}` },
      ]),
    ],
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <JsonLdScript data={jsonLd} />

      {isDraftView && (
        <div className="rounded-2xl border border-black/5 bg-[#FDE6D2] px-4 py-3 text-xs font-bold text-[#5c3a1e]" role="status">
          Draft preview — visible only to you (admin), marked noindex. Status: {article.status}.
        </div>
      )}

      <Reveal>
        <Link
          href="/research"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#15161A] shadow-sm border border-black/5 transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to research
        </Link>
      </Reveal>

      {/* ── Header ── */}
      <Reveal>
        <header className="bento bento-lg overflow-hidden">
          {article.coverImage && (
            <div className="aspect-[21/9] w-full overflow-hidden bg-[#F4F3F0]">
              { }
              <img
                src={`/api/media/${article.coverImage.id}`}
                alt={article.coverImage.altText || `Cover image for ${article.title}`}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-1.5">
              {article.topic && <Chip tone="sky">{article.topic.name}</Chip>}
              {article.contentType && <Chip tone="bone">{article.contentType}</Chip>}
              {isDraftView && <StatusBadge status={article.status} />}
            </div>
            <h1 className="mt-4 text-2xl font-black leading-tight tracking-tight text-[#15161A] sm:text-4xl">{article.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">{article.summary}</p>
            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-gray-400">
              {article.publishedAt && <span>Published {formatDate(article.publishedAt)}</span>}
              <span aria-hidden>·</span>
              <span>Last updated {formatDate(article.updatedAt)}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-3 w-3" aria-hidden /> {article.readingTimeMinutes} min read
              </span>
            </p>
          </div>
        </header>
      </Reveal>

      {/* ── Body ── */}
      <Reveal>
        <section className="bento p-5 sm:p-8">
          <Prose content={article.body} />
        </section>
      </Reveal>

      {/* ── Structured sections ── */}
      <div className="space-y-5">
        {article.researchQuestion && (
          <Section title="Research question">
            <blockquote className="rounded-2xl bg-[#15161A] p-5 text-sm font-semibold leading-relaxed text-white sm:text-base">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#D6F824]">The question</span>
              {article.researchQuestion}
            </blockquote>
          </Section>
        )}
        {article.methodology && (
          <Section title="Data & methodology">
            <Prose content={article.methodology} />
          </Section>
        )}
        {article.findings && (
          <Section title="Main findings">
            <Prose content={article.findings} />
          </Section>
        )}
        {article.limitations && (
          <Section title="Limitations & caveats">
            <Prose content={article.limitations} />
          </Section>
        )}
        {references.length > 0 && (
          <Section title="Sources & references">
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
      </div>

      {/* ── Footer meta ── */}
      <Reveal>
        <div className="bento space-y-3 p-5">
          {article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <TagIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden />
              {article.tags.map((t) => <Chip key={t.id} tone="bone">{t.name}</Chip>)}
            </div>
          )}
          <div className="flex items-start gap-2 border-t border-black/5 pt-3">
            <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
            <p className="text-[11px] leading-relaxed text-gray-500">
              This is independent academic/self-directed work, published to demonstrate analytical capability. It does not constitute financial, legal or investment advice, and does not represent any institution.
            </p>
          </div>
          {article.pdfAssetId && (
            <a
              href={`/api/media/${article.pdfAssetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#15161A] px-4 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              Download PDF version
            </a>
          )}
        </div>
      </Reveal>

      {/* ── Related ── */}
      {related.length > 0 && (
        <section aria-label="Related articles" className="pt-2">
          <h2 className="mb-4 text-lg font-black tracking-tight">Related reading</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <Link key={r.id} href={`/research/${r.slug}`} className="bento bento-hover group block p-5">
                {r.topic && <Chip tone="sky">{r.topic.name}</Chip>}
                <h3 className="mt-2.5 text-sm font-bold leading-snug">{r.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-gray-500">{r.summary}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 transition-colors group-hover:text-[#15161A]">
                  Read article <ArrowUpRight className="h-3 w-3" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
