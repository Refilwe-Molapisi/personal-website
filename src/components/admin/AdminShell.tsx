"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FolderKanban,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  BookOpen,
  Wrench,
  Tags,
  ImageIcon,
  Settings,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export const adminNavItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Projects", url: "/admin/projects", icon: FolderKanban },
  { title: "Research", url: "/admin/research", icon: BookOpen },
  { title: "Skills", url: "/admin/skills", icon: Wrench },
  { title: "Categories", url: "/admin/categories", icon: Tags },
  { title: "Media", url: "/admin/media", icon: ImageIcon },
  { title: "Profile & Settings", url: "/admin/profile", icon: Settings },
];

export function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (url: string) =>
    url === "/admin" ? pathname === "/admin" : pathname.startsWith(url);
  const current = adminNavItems.find((i) => isActive(i.url))?.title ?? "Admin";

  // Escape closes the mobile drawer (links in the drawer also close it on click)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navLinks = (onNavigate?: () => void) => (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-1.5">
      {adminNavItems.map((item) => (
        <Link
          key={item.url}
          href={item.url}
          onClick={onNavigate}
          aria-current={isActive(item.url) ? "page" : undefined}
          className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-all ${
            isActive(item.url)
              ? "bg-[#D6F824] font-bold text-[#141C00] shadow-sm"
              : "font-medium text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {item.title}
        </Link>
      ))}
    </nav>
  );

  const bottomCard = (
    <div className="space-y-2">
      <Link
        href="/"
        className="flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white"
      >
        <Home className="h-4 w-4 shrink-0" /> View public site
      </Link>
      <div className="rounded-2xl border border-white/5 bg-white/5 p-3.5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#D6F824]/20 text-xs font-bold text-[#D6F824]">
            {email.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">Signed in</p>
            <p className="truncate text-[11px] text-white/50">{email}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Log out"
              title="Log out"
              className="grid h-8 w-8 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F3F0] text-[#15161A]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-4 left-4 z-40 hidden w-60 flex-col rounded-[2rem] bg-[#15161A] p-5 text-white shadow-2xl lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-2 pt-1">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#D6F824]">
            <span className="text-sm font-black text-[#141C00]">RM</span>
          </div>
          <span className="text-base font-bold tracking-tight text-white">Admin panel</span>
        </Link>
        <div className="mt-8 flex flex-1 flex-col">{navLinks()}</div>
        {bottomCard}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-[#F4F3F0]/85 px-4 py-3 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={drawerOpen}
          className="grid h-10 w-10 place-items-center rounded-full bg-[#15161A] text-white shadow-sm active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-black tracking-tight">{current}</span>
        <Link href="/" className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-white text-gray-600 shadow-sm border border-black/5" aria-label="View public site">
          <Home className="h-4 w-4" />
        </Link>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm anim-fade-in"
          />
          <aside className="absolute inset-y-3 left-3 flex w-64 flex-col rounded-[1.75rem] bg-[#15161A] p-5 text-white shadow-2xl anim-fade-up">
            <div className="mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#D6F824] text-sm font-black text-[#141C00]">RM</span>
                <span className="text-base font-bold">Admin panel</span>
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-full text-white/60 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col">
              {navLinks(() => setDrawerOpen(false))}
            </div>
            {bottomCard}
          </aside>
        </div>
      )}

      <div className="lg:pl-68">
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 md:px-8 md:pb-12 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
