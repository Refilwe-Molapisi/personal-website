import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/content";
import { buildBreadcrumbSchema, buildItemListSchema, JsonLdScript } from "@/lib/seo";
import { ArticleCard, EmptyState, NoResults } from "@/components/synkra/bento";
import { SearchFilters } from "@/components/synkra/SearchFilters";
import { Reveal } from "@/components/synkra/Reveal";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { q, category, sort, page } = await searchParams;
  const robotsIndexable = !q && !category && !sort && (!page || page === "1");
  return {
    title: "Research & Insights",
    description:
      "Research briefs, market commentary and data notes by Refilwe Molapisi — independent, academic analytical writing with sources, assumptions and limitations stated.",
    alternates: { canonical: "/research" },
    openGraph: {
      title: "Research & Insights · Refilwe Molapisi",
      description:
        "Research briefs, market commentary and data notes — independent, academic analytical writing with sources, assumptions and limitations stated.",
      url: "/research",
    },
    robots: robotsIndexable ? undefined : { index: false, follow: true },
  };
}

export const revalidate = 60;

const PAGE_SIZE = 9;

type SearchParams = Promise<{ q?: string; category?: string; sort?: string; page?: string }>;

export default async function ResearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, category, sort, page } = await searchParams;
  const search = (q ?? "").trim().slice(0, 100);
  const pageNum = Math.max(1, Number(page) || 1);
  const robotsIndexable = !search && !category && !sort && pageNum === 1;

  let topics: Awaited<ReturnType<typeof db.category.findMany>> = [];
  try {
    topics = await db.category.findMany({
      where: { contentType: { in: ["research", "both"] } },
      orderBy: { displayOrder: "asc" },
    });
  } catch {
    // Database not ready — filters render empty.
  }

  const where = {
    status: "published" as const,
    AND: [
      search ? { OR: [{ title: { contains: search } }, { summary: { contains: search } }] } : {},
      category ? { topic: { is: { slug: category } } } : {},
    ],
  };

  const orderBy =
    sort === "oldest" ? [{ publishedAt: "asc" as const }] : sort === "title" ? [{ title: "asc" as const }] : [{ publishedAt: "desc" as const }];

  let total = 0;
  let articles: Awaited<ReturnType<typeof db.researchArticle.findMany>> = [];
  try {
    [total, articles] = await Promise.all([
      db.researchArticle.count({ where }),
      db.researchArticle.findMany({
        where,
        orderBy,
        skip: (pageNum - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { topic: true },
      }),
    ]);
  } catch {
    // Database not ready — render empty state.
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const sp = new URLSearchParams();
    if (search) sp.set("q", search);
    if (category) sp.set("category", category);
    if (sort) sp.set("sort", sort);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/research${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@graph": [
            buildBreadcrumbSchema([
              { name: "Home", url: "/" },
              { name: "Research & Insights", url: "/research" },
            ]),
            ...(robotsIndexable
              ? [
                  buildItemListSchema(
                    "Research and insights by Refilwe Molapisi",
                    "/research",
                    articles.map((a) => ({ name: a.title, url: `/research/${a.slug}` }))
                  ),
                ]
              : []),
          ],
        }}
      />

      <Reveal>
        <header>
          <h1 className="text-2xl font-black tracking-tight text-[#15161A] sm:text-3xl">Research & insights</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
            Independent and academic written work — research briefs, data notes and commentary. Exploratory findings are labelled as such; correlation is never presented as causation.
          </p>
        </header>
      </Reveal>

      <Suspense fallback={<div className="h-11 animate-pulse rounded-full bg-white" />}>
        <SearchFilters
          categories={topics.map((t) => ({ value: t.slug, label: t.name }))}
          sortOptions={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "title", label: "A–Z" },
          ]}
          placeholder="Search research by title or summary…"
        />
      </Suspense>

      {total > 0 && (
        <p className="text-xs font-semibold text-gray-400" role="status">
          {total} published {total === 1 ? "article" : "articles"}
        </p>
      )}

      {articles.length === 0 ? (
        total === 0 && !search && !category ? (
          <EmptyState
            title="No published research yet"
            message="Research briefs, data notes and commentary will appear here once published."
            action={<Link href="/projects" className="text-xs font-bold text-[#15161A] underline underline-offset-4">Browse projects instead</Link>}
          />
        ) : (
          <NoResults onClearHref="/research" />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, idx) => (
            <Reveal key={a.id} delay={0.04 * (idx % 3)}>
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

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-2 pt-2">
          {pageNum > 1 && (
            <Link href={pageHref(pageNum - 1)} className="rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5">
              Previous
            </Link>
          )}
          <span className="px-2 text-xs font-semibold text-gray-500">Page {pageNum} of {totalPages}</span>
          {pageNum < totalPages && (
            <Link href={pageHref(pageNum + 1)} className="rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5">
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
