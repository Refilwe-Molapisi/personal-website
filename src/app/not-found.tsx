import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#F4F3F0] px-4">
      <div className="bento bento-lg w-full max-w-lg p-8 text-center sm:p-12">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#15161A]">
          <Compass className="h-6 w-6 text-[#D6F824]" aria-hidden />
        </span>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-widest text-gray-400">404 — Page not found</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-[#15161A] sm:text-3xl">
          This page doesn&apos;t exist
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
          The page may have been moved, unpublished, or the address might be slightly off. Here are the places you probably want:
        </p>
        <nav aria-label="Helpful links" className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          {[
            { href: "/", label: "Home" },
            { href: "/projects", label: "Projects" },
            { href: "/research", label: "Research" },
            { href: "/about", label: "About" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#15161A] px-4 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              {l.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
