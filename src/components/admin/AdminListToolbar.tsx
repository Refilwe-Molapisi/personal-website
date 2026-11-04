"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Search, X } from "lucide-react";

/** Search + status filter toolbar for admin lists (URL-synced). */
export function AdminListToolbar({ placeholder = "Search by title…" }: { placeholder?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const paramQuery = params.get("q") ?? "";
  const [query, setQuery] = useState(paramQuery);
  const [syncedQuery, setSyncedQuery] = useState(paramQuery);
  // Render-phase state adjustment when the URL changes externally
  if (syncedQuery !== paramQuery) {
    setSyncedQuery(paramQuery);
    setQuery(paramQuery);
  }
  const status = params.get("status") ?? "";

  useEffect(() => {
    const current = params.get("q") ?? "";
    if (query === current) return;
    const t = setTimeout(() => {
      const sp = new URLSearchParams(params.toString());
      if (query) sp.set("q", query);
      else sp.delete("q");
      sp.delete("page");
      startTransition(() => router.push(`?${sp.toString()}`, { scroll: false }));
    }, 350);
    return () => clearTimeout(t);
     
  }, [query]);

  function setStatus(next: string) {
    const sp = new URLSearchParams(params.toString());
    if (next) sp.set("status", next);
    else sp.delete("status");
    sp.delete("page");
    startTransition(() => router.push(`?${sp.toString()}`, { scroll: false }));
  }

  const statuses = ["", "draft", "published", "archived"];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex min-w-0 flex-1 items-center">
        <Search className="pointer-events-none absolute left-4 h-4 w-4 text-gray-400" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-11 w-full rounded-full border border-black/5 bg-white pl-11 pr-10 text-sm shadow-sm outline-none placeholder:text-gray-400 focus:shadow-md"
        />
        {pending && <Loader2 className="absolute right-4 h-4 w-4 animate-spin text-gray-400" />}
        {!pending && query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 grid h-6 w-6 place-items-center rounded-full text-gray-400 hover:bg-[#F4F3F0]">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="flex rounded-full border border-black/5 bg-white p-1 shadow-sm" role="group" aria-label="Filter by status">
        {statuses.map((s) => (
          <button
            key={s || "all"}
            type="button"
            aria-pressed={status === s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition-all ${status === s ? "bg-[#15161A] text-white shadow-sm" : "text-gray-500 hover:text-[#15161A]"}`}
          >
            {s || "All"}
          </button>
        ))}
      </div>
    </div>
  );
}
