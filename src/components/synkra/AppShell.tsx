"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  ExternalLink,
  FolderKanban,
  Home,
  Linkedin,
  Menu,
  UserRound,
  Wrench,
  X,
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
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F3F0] text-[#15161A]">
      {/* ── Website header ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#F4F3F0]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Brand */}
          <Link href="/" onClick={closeMenu} className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-90">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#15161A]">
              <span className="text-[11px] font-black text-[#D6F824]">RM</span>
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-tight">{displayName}</span>
              <span className="hidden truncate text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:block">
                {headline}
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {publicNavItems.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                aria-current={isActive(item.url) ? "page" : undefined}
                className={`rounded-full px-3.5 py-2 text-sm transition-all duration-200 ${
                  isActive(item.url)
                    ? "bg-white font-bold text-[#15161A] shadow-sm"
                    : "font-medium text-gray-500 hover:text-[#15161A]"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {linkedinUrl ? (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${displayName} on LinkedIn (opens in a new tab)`}
                className="hidden h-10 items-center gap-2 rounded-full bg-[#15161A] px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#24262E] hover:shadow-md active:scale-95 sm:flex"
              >
                <Linkedin className="h-4 w-4" />
                <span className="hidden lg:inline">LinkedIn</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            ) : null}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="grid h-10 w-10 place-items-center rounded-full bg-[#15161A] text-white shadow-sm transition-all active:scale-95 md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation panel */}
        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Primary mobile"
            className="border-t border-black/5 bg-[#F4F3F0] px-4 pb-4 pt-2 md:hidden"
          >
            <ul className="flex flex-col gap-1">
              {publicNavItems.map((item) => (
                <li key={item.url}>
                  <Link
                    href={item.url}
                    onClick={closeMenu}
                    aria-current={isActive(item.url) ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors ${
                      isActive(item.url)
                        ? "bg-white font-bold text-[#15161A] shadow-sm"
                        : "font-medium text-gray-500 hover:text-[#15161A]"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="mt-2 flex items-center gap-3 rounded-2xl bg-[#15161A] px-4 py-3 text-sm font-semibold text-white shadow-sm"
              >
                <Linkedin className="h-4 w-4 shrink-0" />
                <span>Connect on LinkedIn</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            )}
          </nav>
        )}
      </header>

      {/* ── Page content ───────────────────────────────────── */}
      <main className="flex-1 px-4 pb-16 pt-6 sm:px-6 md:pb-20">{children}</main>

      <SiteFooter displayName={displayName} headline={headline} linkedinUrl={linkedinUrl} />
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
    <footer className="border-t border-black/5 px-4 pb-10 pt-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        </nav>
      </div>
      <div className="mx-auto mt-6 max-w-6xl border-t border-black/5 pt-4">
        <p className="text-[11px] text-gray-400">© {new Date().getFullYear()} {displayName}</p>
      </div>
    </footer>
  );
}
