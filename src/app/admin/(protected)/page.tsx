import Link from "next/link";
import {
  AlertCircle,
  Archive,
  BookOpen,
  Clock3,
  FileEdit,
  FolderKanban,
  Globe2,
  ImagePlus,
  PlusCircle,
  Settings,
  UserRound,
  Wrench,
} from "lucide-react";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { formatShortDate } from "@/lib/content";
import { StatCard } from "@/components/synkra/bento";
import { Reveal } from "@/components/synkra/Reveal";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [settings, pubProjects, draftProjects, archProjects, pubArticles, draftArticles, recentProjects, recentArticles] =
    await Promise.all([
      getSiteSettings(),
      db.project.count({ where: { status: "published" } }),
      db.project.count({ where: { status: "draft" } }),
      db.project.count({ where: { status: "archived" } }),
      db.researchArticle.count({ where: { status: "published" } }),
      db.researchArticle.count({ where: { status: "draft" } }),
      db.project.findMany({ orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, title: true, slug: true, status: true, updatedAt: true } }),
      db.researchArticle.findMany({ orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, title: true, slug: true, status: true, updatedAt: true } }),
    ]);

  const warnings: string[] = [];
  if (!settings?.linkedinUrl) warnings.push("No LinkedIn URL is set — add it in Profile & Settings so visitors can reach you.");
  if (!settings?.defaultMetaDescription) warnings.push("No default meta description is set — search engines will fall back to generic text.");
  const featuredCount = await db.project.count({ where: { isFeatured: true, status: "published" } });
  if (featuredCount === 0) warnings.push("No featured projects — mark at least one published project as featured for the home page.");

  const recent = [
    ...recentProjects.map((p) => ({ ...p, kind: "Project" as const, href: `/admin/projects/${p.id}/edit` })),
    ...recentArticles.map((a) => ({ ...a, kind: "Research" as const, href: `/admin/research/${a.id}/edit` })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6);

  const quickActions = [
    { href: "/admin/projects/new", label: "New project", icon: PlusCircle },
    { href: "/admin/research/new", label: "New research article", icon: FileEdit },
    { href: "/admin/skills", label: "Manage skills", icon: Wrench },
    { href: "/admin/profile", label: "Edit profile", icon: UserRound },
  ];

  return (
    <div className="space-y-7">
      <Reveal>
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Your content at a glance.</p>
          </div>
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5">
            <Globe2 className="h-3.5 w-3.5" aria-hidden /> View site
          </Link>
        </header>
      </Reveal>

      {/* Setup warnings */}
      {warnings.length > 0 && (
        <Reveal>
          <div className="rounded-2xl border border-black/5 bg-[#FDE6D2] p-4 sm:p-5">
            <p className="flex items-center gap-2 text-xs font-bold text-[#5c3a1e]">
              <AlertCircle className="h-4 w-4" aria-hidden /> Setup checklist
            </p>
            <ul className="mt-2 space-y-1.5">
              {warnings.map((w) => (
                <li key={w} className="text-xs leading-relaxed text-[#5c3a1e]">• {w}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Reveal><StatCard label="Published projects" value={pubProjects} icon={FolderKanban} /></Reveal>
        <Reveal delay={0.05}><StatCard label="Project drafts" value={draftProjects} icon={FileEdit} subtext={`${archProjects} archived`} /></Reveal>
        <Reveal delay={0.1}><StatCard label="Published articles" value={pubArticles} icon={BookOpen} /></Reveal>
        <Reveal delay={0.15}><StatCard label="Research drafts" value={draftArticles} icon={Clock3} /></Reveal>
      </div>

      {/* Quick actions */}
      <Reveal>
        <section aria-label="Quick actions">
          <h2 className="mb-3 text-base font-black tracking-tight">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((qa) => (
              <Link key={qa.href} href={qa.href} className="bento bento-hover flex items-center gap-3 p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#15161A]">
                  <qa.icon className="h-4 w-4 text-[#D6F824]" aria-hidden />
                </span>
                <span className="text-sm font-bold">{qa.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Recently updated */}
      <Reveal>
        <section aria-label="Recently updated content">
          <h2 className="mb-3 text-base font-black tracking-tight">Recently updated</h2>
          <div className="bento divide-y divide-black/5">
            {recent.length === 0 && <p className="p-5 text-sm text-gray-500">No content yet — create your first project.</p>}
            {recent.map((item) => (
              <Link key={`${item.kind}-${item.id}`} href={item.href} className="flex items-center gap-3 p-4 transition-colors hover:bg-[#fafaf7]">
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${item.status === "published" ? "bg-[#D6F824] text-[#141C00]" : item.status === "draft" ? "bg-[#D8E9FE] text-[#1e3a5f]" : "bg-gray-200 text-gray-600"}`}>
                  {item.status}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.title}</p>
                  <p className="text-[11px] text-gray-400">{item.kind} · updated {formatShortDate(item.updatedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/media" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5">
            <ImagePlus className="h-3.5 w-3.5" aria-hidden /> Media library
          </Link>
          <Link href="/admin/categories" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5">
            <Settings className="h-3.5 w-3.5" aria-hidden /> Categories
          </Link>
          <Link href="/admin/research" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5">
            <Archive className="h-3.5 w-3.5" aria-hidden /> Archive states
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
