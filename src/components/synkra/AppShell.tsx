"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Home,
  Linkedin,
  FolderKanban,
  Wrench,
  UserRound,
  ExternalLink,
} from "lucide-react";

export const publicNavItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Skills & Tools", url: "/skills", icon: Wrench },
  { title: "Research", url: "/research", icon: BookOpen },
  { title: "About", url: "/about", icon: UserRound },
];

type AppShellProps = {
  children: React.ReactNode;
  displayName: string;
  headline: string;
  linkedinUrl: string;
};

export function AppShell({ children, displayName, headline, linkedinUrl }: AppShellProps) {
  const pathname = usePathname();
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));
  const currentTitle = publicNavItems.find((i) => isActive(i.url))?.title ?? "Home";

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F3F0] text-[#15161A]">
      {/* ── Desktop floating dark pill sidebar ── */}
      <aside className="fixed inset-y-4 left-4 z-40 hidden w-60 flex-col rounded-[2rem] bg-[#15161A] p-5 text-white shadow-2xl md:flex">
        <Link href="/" className="flex items-center gap-2.5 px-2 pt-1 transition-opacity hover:opacity-90">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#D6F824]">
            <span className="text-sm font-black text-[#141C00]">RM</span>
          </div>
          <span className="truncate text-base font-bold tracking-tight text-white">{displayName}</span>
        </Link>

        <nav aria-label="Primary" className="mt-8 flex flex-1 flex-col gap-1.5">
          {publicNavItems.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              aria-current={isActive(item.url) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-all duration-200 ${
                isActive(item.url)
                  ? "bg-[#D6F824] font-bold text-[#141C00] shadow-sm"
                  : "font-medium text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-3.5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FDE6D2] text-xs font-bold text-[#5c3a1e]">
              RM
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="truncate text-xs text-white/50">{headline}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex min-h-screen flex-col md:pl-68">
        <header className="sticky top-0 z-30 bg-[#F4F3F0]/85 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-4 md:px-8">
            {/* Mobile brand */}
            <Link href="/" className="flex items-center gap-2 md:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#15161A]">
                <span className="text-[11px] font-black text-[#D6F824]">RM</span>
              </div>
              <span className="text-base font-bold tracking-tight">{displayName}</span>
            </Link>

            {/* Desktop: current section pill */}
            <div className="hidden min-w-0 flex-1 items-center md:flex">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-xs font-bold text-gray-500 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D6F824] ring-1 ring-black/10" aria-hidden />
                {currentTitle}
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2.5">
              {linkedinUrl ? (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${displayName} on LinkedIn (opens in a new tab)`}
                  className="flex h-10 items-center gap-2 rounded-full bg-[#15161A] px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#24262E] hover:shadow-md active:scale-95"
                >
                  <Linkedin className="h-4 w-4" />
                  <span className="hidden sm:inline">LinkedIn</span>
                  <ExternalLink className="h-3 w-3 opacity-60 sm:hidden" />
                </a>
              ) : (
                <span
                  className="flex h-10 items-center gap-2 rounded-full border border-black/5 bg-white px-4 text-sm font-medium text-gray-400 shadow-sm"
                  title="LinkedIn profile link can be set in the admin panel"
                >
                  <Linkedin className="h-4 w-4" />
                  <span className="hidden sm:inline">LinkedIn</span>
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-32 pt-2 md:px-8 md:pb-12">{children}</main>

        <SiteFooter displayName={displayName} headline={headline} linkedinUrl={linkedinUrl} />
      </div>

      {/* ── Mobile floating pill nav ── */}
      <nav
        aria-label="Primary mobile"
        className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full border border-white/10 bg-[#15161A] px-3 py-2 shadow-2xl md:hidden"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        {publicNavItems.map((item) => (
          <Link
            key={item.url}
            href={item.url}
            aria-label={item.title}
            aria-current={isActive(item.url) ? "page" : undefined}
            className={`grid h-11 w-11 place-items-center rounded-full transition-all duration-200 ${
              isActive(item.url)
                ? "scale-105 bg-[#D6F824] text-[#141C00] shadow-sm"
                : "text-white/60 active:scale-95"
            }`}
          >
            <item.icon className="h-5 w-5" />
          </Link>
        ))}
      </nav>
    </div>
  );
}

function SiteFooter({
  displayName,
  headline,
  linkedinUrl,
}: {
  displayName: string;
  headline: string;
  linkedinUrl: string;
}) {
  return (
    <footer className="mt-auto px-4 pb-28 pt-6 md:px-8 md:pb-8">
      <div className="bento flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#15161A]">{displayName}</p>
          <p className="mt-0.5 text-xs text-gray-500">{headline}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-gray-500">
          <Link href="/projects" className="transition-colors hover:text-[#15161A]">Projects</Link>
          <Link href="/skills" className="transition-colors hover:text-[#15161A]">Skills</Link>
          <Link href="/research" className="transition-colors hover:text-[#15161A]">Research</Link>
          <Link href="/about" className="transition-colors hover:text-[#15161A]">About</Link>
          <Link href="/privacy" className="transition-colors hover:text-[#15161A]">Privacy</Link>
          {linkedinUrl && (
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-[#15161A]">
              LinkedIn <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <span className="text-gray-400">© {new Date().getFullYear()} {displayName}</span>
        </nav>
      </div>
    </footer>
  );
}
