import Link from "next/link";
import { ArrowUpRight, BookOpen, FlaskConical, FolderKanban, SearchX } from "lucide-react";
import { SKILL_STATUS_CLASSES, STATUS_CLASSES } from "@/lib/content";

/* ── Section heading ─────────────────────────────────────────────────────── */
export function SectionHeading({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-black tracking-tight text-[#15161A] sm:text-2xl">{title}</h2>
        {sub && <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Status / meta pill badges ───────────────────────────────────────────── */
export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:text-[11px] ${STATUS_CLASSES[status] ?? "bg-gray-200 text-gray-600"} ${className}`}>
      {status}
    </span>
  );
}

export function Chip({ children, tone = "bone" }: { children: React.ReactNode; tone?: "bone" | "lime" | "peach" | "sky" | "ink" }) {
  const tones: Record<string, string> = {
    bone: "bg-[#F4F3F0] text-gray-600 border-black/5",
    lime: "bg-[#D6F824] text-[#141C00]",
    peach: "bg-[#FDE6D2] text-[#5c3a1e]",
    sky: "bg-[#D8E9FE] text-[#1e3a5f]",
    ink: "bg-[#15161A] text-white",
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold sm:text-[11px] ${tones[tone]}`}>
      {children}
    </span>
  );
}

/* ── Pill tabs (segmented switcher) ──────────────────────────────────────── */
export function PillTabs({
  options,
  active,
  onChange,
  label,
}: {
  options: string[];
  active: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  return (
    <div role="tablist" aria-label={label ?? "Filter options"} className="flex w-fit flex-wrap rounded-full border border-black/5 bg-white p-1 shadow-sm">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          aria-selected={option === active}
          onClick={() => onChange(option)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
            option === active ? "bg-[#15161A] text-white shadow-sm" : "text-gray-500 hover:text-[#15161A]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
export function EmptyState({
  icon: Icon = FolderKanban,
  title,
  message,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bento flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#F4F3F0]">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="mt-4 text-sm font-bold text-[#15161A]">{title}</p>
      <p className="mt-1 max-w-md text-xs leading-relaxed text-gray-500">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function NoResults({ onClearHref }: { onClearHref: string }) {
  return (
    <EmptyState
      icon={SearchX}
      title="No results"
      message="Nothing matched your search and filters. Try different keywords or clear the filters to see everything."
      action={
        <Link href={onClearHref} className="inline-flex items-center gap-1.5 rounded-full bg-[#15161A] px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-95">
          Clear filters
        </Link>
      }
    />
  );
}

/* ── Project card ────────────────────────────────────────────────────────── */
export function ProjectCard({
  project,
}: {
  project: {
    slug: string;
    title: string;
    summary: string;
    tools: string[];
    categoryName?: string | null;
    coverUrl?: string | null;
    coverAlt?: string | null;
    projectType?: string | null;
    dateLabel?: string | null;
  };
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="bento bento-hover group flex h-full flex-col overflow-hidden"
    >
      {project.coverUrl ? (
        <div className="aspect-[16/9] w-full overflow-hidden bg-[#F4F3F0]">
          { }
          <img
            src={project.coverUrl}
            alt={project.coverAlt || `Cover image for ${project.title}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div className="grid aspect-[16/9] w-full place-items-center bg-[#15161A]">
          <FolderKanban className="h-8 w-8 text-[#D6F824] opacity-80 transition-transform duration-500 group-hover:scale-110" aria-hidden />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          {project.categoryName && <Chip tone="lime">{project.categoryName}</Chip>}
          {project.projectType && <Chip tone="bone">{project.projectType}</Chip>}
        </div>
        <h3 className="mt-3 text-base font-bold leading-snug tracking-tight text-[#15161A] transition-colors group-hover:text-[#3a3d46] sm:text-lg">
          {project.title}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-gray-500 sm:text-[13px]">{project.summary}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          {project.tools.length > 0 && (
            <p className="truncate text-[11px] font-semibold text-gray-400">{project.tools.slice(0, 3).join(" · ")}</p>
          )}
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#F4F3F0] transition-all duration-200 group-hover:bg-[#D6F824]">
            <ArrowUpRight className="h-4 w-4 text-[#15161A]" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Research article card ───────────────────────────────────────────────── */
export function ArticleCard({
  article,
}: {
  article: {
    slug: string;
    title: string;
    summary: string;
    topicName?: string | null;
    contentType?: string | null;
    publishedLabel?: string | null;
    readingTime?: number | null;
    coverUrl?: string | null;
    coverAlt?: string | null;
  };
}) {
  return (
    <Link
      href={`/research/${article.slug}`}
      className="bento bento-hover group flex h-full flex-col p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {article.topicName && <Chip tone="sky">{article.topicName}</Chip>}
        {article.contentType && <Chip tone="bone">{article.contentType}</Chip>}
      </div>
      <h3 className="mt-3 text-base font-bold leading-snug tracking-tight text-[#15161A] transition-colors group-hover:text-[#3a3d46] sm:text-lg">
        {article.title}
      </h3>
      <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-gray-500 sm:text-[13px]">{article.summary}</p>
      <div className="mt-auto flex items-center justify-between pt-4 text-[11px] font-semibold text-gray-400">
        <span className="inline-flex items-center gap-2">
          {article.publishedLabel && <span>{article.publishedLabel}</span>}
          {article.readingTime ? (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> {article.readingTime} min read
              </span>
            </>
          ) : null}
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#F4F3F0] transition-all duration-200 group-hover:bg-[#D6F824]">
          <ArrowUpRight className="h-4 w-4 text-[#15161A]" />
        </span>
      </div>
    </Link>
  );
}

/* ── Simulated data notice ───────────────────────────────────────────────── */
export function DataNotice({ notice }: { notice: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-black/5 bg-[#FDE6D2] p-4">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-[#5c3a1e]" aria-hidden />
      <p className="text-xs leading-relaxed text-[#5c3a1e] sm:text-[13px]">
        <span className="font-bold">About this work: </span>
        {notice}
      </p>
    </div>
  );
}

/* ── Stat card (bento metric) ────────────────────────────────────────────── */
export function StatCard({
  label,
  value,
  delta,
  subtext,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  delta?: string;
  subtext?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bento bento-hover p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-xs font-semibold text-gray-500">{label}</p>
        {Icon && (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#F4F3F0]">
            <Icon className="h-4 w-4 text-[#15161A]" />
          </span>
        )}
      </div>
      <p className="mt-1.5 text-2xl font-black tracking-tight text-[#15161A] sm:text-3xl">{value}</p>
      {delta && (
        <span className="mt-2 inline-block rounded-full bg-[#D6F824] px-2.5 py-0.5 text-[11px] font-bold text-[#141C00]">
          {delta}
        </span>
      )}
      {subtext && <p className="mt-1 text-[11px] text-gray-400">{subtext}</p>}
    </div>
  );
}
