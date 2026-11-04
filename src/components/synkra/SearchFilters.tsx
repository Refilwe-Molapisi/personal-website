"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";

type FilterOption = { value: string; label: string };

/**
 * URL-synced search + filter controls. Updates searchParams (debounced),
 * preserving shareable links per the spec.
 */
export function SearchFilters({
  categories,
  sortOptions,
  placeholder = "Search…",
  showSort = true,
}: {
  categories: FilterOption[];
  sortOptions?: FilterOption[];
  placeholder?: string;
  showSort?: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const paramQuery = params.get("q") ?? "";
  const [query, setQuery] = useState(paramQuery);
  const [syncedQuery, setSyncedQuery] = useState(paramQuery);
  // Render-phase state adjustment when the URL changes externally (e.g. Clear filters)
  if (syncedQuery !== paramQuery) {
    setSyncedQuery(paramQuery);
    setQuery(paramQuery);
  }

  const currentCategory = params.get("category") ?? "";
  const currentSort = params.get("sort") ?? "";

  function pushParams(mutate: (sp: URLSearchParams) => void) {
    const sp = new URLSearchParams(params.toString());
    mutate(sp);
    // Reset page when filters change
    sp.delete("page");
    startTransition(() => {
      router.push(`?${sp.toString()}`, { scroll: false });
    });
  }

  // Debounced search
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (query === current) return;
    const t = setTimeout(() => {
      pushParams((sp) => {
        if (query) sp.set("q", query);
        else sp.delete("q");
      });
    }, 350);
    return () => clearTimeout(t);
     
  }, [query]);

  const hasFilters = Boolean(query || currentCategory || currentSort);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex min-w-0 flex-1 items-center">
          <Search className="pointer-events-none absolute left-4 h-4 w-4 text-gray-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="h-11 w-full rounded-full border border-black/5 bg-white pl-11 pr-10 text-sm text-[#15161A] shadow-sm outline-none transition-shadow placeholder:text-gray-400 focus:shadow-md"
          />
          {pending && (
            <Loader2 className="absolute right-4 h-4 w-4 animate-spin text-gray-400" aria-label="Searching" />
          )}
          {!pending && query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 grid h-6 w-6 place-items-center rounded-full text-gray-400 hover:bg-[#F4F3F0] hover:text-[#15161A]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        {showSort && sortOptions && sortOptions.length > 0 && (
          <div className="flex rounded-full border border-black/5 bg-white p-1 shadow-sm" role="group" aria-label="Sort">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={(currentSort || sortOptions[0].value) === opt.value}
                onClick={() =>
                  pushParams((sp) => {
                    if (opt.value === sortOptions[0].value) sp.delete("sort");
                    else sp.set("sort", opt.value);
                  })
                }
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  (currentSort || sortOptions[0].value) === opt.value
                    ? "bg-[#15161A] text-white shadow-sm"
                    : "text-gray-500 hover:text-[#15161A]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button
            type="button"
            aria-pressed={!currentCategory}
            onClick={() => pushParams((sp) => sp.delete("category"))}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
              !currentCategory
                ? "border-transparent bg-[#D6F824] text-[#141C00]"
                : "border-black/5 bg-white text-gray-500 hover:text-[#15161A]"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-pressed={currentCategory === c.value}
              onClick={() =>
                pushParams((sp) => {
                  if (currentCategory === c.value) sp.delete("category");
                  else sp.set("category", c.value);
                })
              }
              className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                currentCategory === c.value
                  ? "border-transparent bg-[#D6F824] text-[#141C00]"
                  : "border-black/5 bg-white text-gray-500 hover:text-[#15161A]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {hasFilters && (
        <button
          type="button"
          onClick={() => startTransition(() => router.push("?", { scroll: false }))}
          className="text-xs font-semibold text-gray-400 underline underline-offset-4 transition-colors hover:text-[#15161A]"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
