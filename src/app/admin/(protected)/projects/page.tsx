import Link from "next/link";
import { Suspense } from "react";
import { PlusCircle } from "lucide-react";
import { db } from "@/lib/db";
import { formatShortDate, parseStringList } from "@/lib/content";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { ContentRowActions } from "@/components/admin/ContentRowActions";
import { Reveal } from "@/components/synkra/Reveal";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;
type SearchParams = Promise<{ q?: string; status?: string; page?: string }>;

export default async function AdminProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, status, page } = await searchParams;
  const search = (q ?? "").trim().slice(0, 100);
  const pageNum = Math.max(1, Number(page) || 1);

  const validStatus = ["draft", "published", "archived"].includes(status ?? "") ? status : undefined;
  const where = {
    AND: [search ? { title: { contains: search } } : {}, validStatus ? { status: validStatus } : {}],
  };

  const [total, projects] = await Promise.all([
    db.project.count({ where }),
    db.project.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (pageNum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: true },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Projects</h1>
            <p className="mt-1 text-sm text-gray-500">{total} total</p>
          </div>
          <Link href="/admin/projects/new" className="inline-flex items-center gap-2 rounded-full bg-[#15161A] px-4 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-95">
            <PlusCircle className="h-4 w-4" /> New project
          </Link>
        </div>
      </Reveal>

      <Suspense fallback={<div className="h-11 animate-pulse rounded-full bg-white" />}>
        <AdminListToolbar placeholder="Search projects by title…" />
      </Suspense>

      <Reveal>
        <div className="bento divide-y divide-black/5 overflow-hidden">
          {projects.length === 0 && (
            <p className="p-6 text-sm text-gray-500">No projects match. Create one with “New project”.</p>
          )}
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-4">
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${p.status === "published" ? "bg-[#D6F824] text-[#141C00]" : p.status === "draft" ? "bg-[#D8E9FE] text-[#1e3a5f]" : "bg-gray-200 text-gray-600"}`}>
                {p.status}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{p.title}</p>
                <p className="truncate text-[11px] text-gray-400">
                  {p.category?.name ?? "No category"} · {parseStringList(p.tools).slice(0, 3).join(" · ") || "no tools"} · updated {formatShortDate(p.updatedAt)}
                  {p.isFeatured && <span className="ml-1.5 font-bold text-[#5c7a00]">★ featured</span>}
                </p>
              </div>
              <ContentRowActions kind="project" id={p.id} status={p.status} slug={p.slug} />
            </div>
          ))}
        </div>
      </Reveal>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
          {pageNum > 1 && (
            <Link href={`/admin/projects?page=${pageNum - 1}${search ? `&q=${encodeURIComponent(search)}` : ""}${validStatus ? `&status=${validStatus}` : ""}`} className="rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm border border-black/5">
              Previous
            </Link>
          )}
          <span className="text-xs font-semibold text-gray-500">Page {pageNum} of {totalPages}</span>
          {pageNum < totalPages && (
            <Link href={`/admin/projects?page=${pageNum + 1}${search ? `&q=${encodeURIComponent(search)}` : ""}${validStatus ? `&status=${validStatus}` : ""}`} className="rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm border border-black/5">
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
