import type { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { parseStringList } from "@/lib/content";
import { buildBreadcrumbSchema, buildItemListSchema, JsonLdScript } from "@/lib/seo";
import { EmptyState, ProjectCard, NoResults } from "@/components/synkra/bento";
import { SearchFilters } from "@/components/synkra/SearchFilters";
import { Reveal } from "@/components/synkra/Reveal";
import Link from "next/link";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  // Filtered/paginated views should not be indexed (duplicate content).
  const { q, category, sort, page } = await searchParams;
  const robotsIndexable = !q && !category && !sort && (!page || page === "1");
  return {
    title: "Projects",
    description:
      "Published analytical projects by Refilwe Molapisi: business intelligence dashboards, commercial and market research, and economic analysis — each with method, findings and limitations.",
    alternates: { canonical: "/projects" },
    openGraph: {
      title: "Projects · Refilwe Molapisi",
      description:
        "Published analytical projects: business intelligence dashboards, commercial and market research, and economic analysis — each with method, findings and limitations.",
      url: "/projects",
    },
    robots: robotsIndexable ? undefined : { index: false, follow: true },
  };
}

export const revalidate = 60;

const PAGE_SIZE = 9;

type SearchParams = Promise<{ q?: string; category?: string; sort?: string; page?: string }>;

export default async function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, category, sort, page } = await searchParams;
  const search = (q ?? "").trim().slice(0, 100);
  const pageNum = Math.max(1, Number(page) || 1);

  // Filtered/paginated views should not outrank the canonical listing.
  const robotsIndexable = !search && !category && !sort && pageNum === 1;

  let categories: Awaited<ReturnType<typeof db.category.findMany>> = [];
  try {
    categories = await db.category.findMany({
      where: { contentType: { in: ["project", "both"] } },
      orderBy: { displayOrder: "asc" },
    });
  } catch {
    // Database not ready — filters render empty.
  }

  const categoryMap: Record<string, string> = { newest: "newest", oldest: "oldest", title: "title", featured: "featured" };
  const sortKey = sort && categoryMap[sort] ? sort : "featured";

  const where = {
    status: "published" as const,
    AND: [
      search
        ? {
            OR: [
              { title: { contains: search } },
              { summary: { contains: search } },
            ],
          }
        : {},
      category ? { category: { is: { slug: category } } } : {},
    ],
  };

  const orderBy =
    sortKey === "newest"
      ? [{ publishedAt: "desc" as const }]
      : sortKey === "oldest"
        ? [{ publishedAt: "asc" as const }]
        : sortKey === "title"
          ? [{ title: "asc" as const }]
          : [{ isFeatured: "desc" as const }, { displayOrder: "asc" as const }, { publishedAt: "desc" as const }];

  let total = 0;
  let projects: Awaited<ReturnType<typeof db.project.findMany>> = [];
  try {
    [total, projects] = await Promise.all([
      db.project.count({ where }),
      db.project.findMany({
        where,
        orderBy,
        skip: (pageNum - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { category: true, coverImage: true },
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
    return `/projects${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@graph": [
            buildBreadcrumbSchema([
              { name: "Home", url: "/" },
              { name: "Projects", url: "/projects" },
            ]),
            ...(robotsIndexable
              ? [
                  buildItemListSchema(
                    "Analytical projects by Refilwe Molapisi",
                    "/projects",
                    projects.map((p) => ({ name: p.title, url: `/projects/${p.slug}` }))
                  ),
                ]
              : []),
          ],
        }}
      />

      <Reveal>
        <header>
          <h1 className="text-2xl font-black tracking-tight text-[#15161A] sm:text-3xl">Projects</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
            Published analytical work. Every project states the research question, data, method, findings and limitations — so you can judge the work, not just the output.
          </p>
        </header>
      </Reveal>

      <Suspense fallback={<div className="h-11 animate-pulse rounded-full bg-white" />}>
        <SearchFilters
          categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
          sortOptions={[
            { value: "featured", label: "Featured" },
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "title", label: "A–Z" },
          ]}
          placeholder="Search projects by title or summary…"
        />
      </Suspense>

      {total > 0 && (
        <p className="text-xs font-semibold text-gray-400" role="status">
          {total} published {total === 1 ? "project" : "projects"}
        </p>
      )}

      {projects.length === 0 ? (
        total === 0 && !search && !category ? (
          <EmptyState
            title="No published projects yet"
            message="Analytical projects will appear here once they are published. Explore the research and skills pages in the meantime."
            action={<Link href="/research" className="text-xs font-bold text-[#15161A] underline underline-offset-4">Browse research</Link>}
          />
        ) : (
          <NoResults onClearHref="/projects" />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, idx) => (
            <Reveal key={p.id} delay={0.04 * (idx % 3)}>
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
