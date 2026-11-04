"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { deleteCategoryAction, saveCategoryAction } from "@/app/actions/content";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  contentType: string;
  description: string | null;
  displayOrder: number;
  usageCount: number;
};

type Draft = { id?: string; name: string; contentType: string; description: string; displayOrder: number };

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save() {
    if (!draft) return;
    setError(null);
    startTransition(async () => {
      const res = await saveCategoryAction(draft);
      if (!res.ok) {
        setError(res.error ?? "Save failed.");
        return;
      }
      setDraft(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Categories power the public filters. Deleting is blocked while content uses a category.</p>
        <button
          type="button"
          onClick={() => setDraft({ name: "", contentType: "both", description: "", displayOrder: categories.length + 1 })}
          className="inline-flex items-center gap-2 rounded-full bg-[#15161A] px-4 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add category
        </button>
      </div>

      {error && <p role="alert" className="rounded-2xl bg-[#FDE6D2] px-4 py-3 text-xs font-bold text-[#5c3a1e]">{error}</p>}

      {draft && (
        <div className="bento space-y-3.5 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black tracking-tight">{draft.id ? "Edit category" : "New category"}</h2>
            <button type="button" onClick={() => setDraft(null)} aria-label="Cancel" className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#F4F3F0]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">Name *</span>
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">Applies to</span>
              <select value={draft.contentType} onChange={(e) => setDraft({ ...draft, contentType: e.target.value })} className={inputCls}>
                <option value="both">Projects & research</option>
                <option value="project">Projects only</option>
                <option value="research">Research only</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">Display order</span>
              <input type="number" value={draft.displayOrder} onChange={(e) => setDraft({ ...draft, displayOrder: Number(e.target.value) })} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">Description</span>
              <input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={inputCls} />
            </label>
          </div>
          <button type="button" onClick={save} disabled={pending} className="inline-flex items-center gap-1.5 rounded-full bg-[#D6F824] px-5 py-2.5 text-xs font-bold text-[#141C00] transition-transform hover:-translate-y-0.5 disabled:opacity-60">
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save category
          </button>
        </div>
      )}

      <div className="bento divide-y divide-black/5">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-4">
            <span className="shrink-0 rounded-full bg-[#F4F3F0] px-2.5 py-0.5 text-[10px] font-bold text-gray-500">
              {c.contentType === "both" ? "both" : c.contentType}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{c.name}</p>
              <p className="truncate text-[11px] text-gray-400">
                /{c.slug} · used by {c.usageCount} item{c.usageCount === 1 ? "" : "s"}
                {c.description ? ` · ${c.description}` : ""}
              </p>
            </div>
            <button type="button" aria-label={`Edit ${c.name}`} onClick={() => setDraft({ id: c.id, name: c.name, contentType: c.contentType, description: c.description ?? "", displayOrder: c.displayOrder })} className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-[#F4F3F0] hover:text-[#15161A]">
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={`Delete ${c.name}`}
              onClick={() => {
                if (!window.confirm(`Delete category "${c.name}"?`)) return;  
                startTransition(async () => {
                  const res = await deleteCategoryAction(c.id);
                  if (!res.ok) setError(res.error ?? "Delete failed.");
                  router.refresh();
                });
              }}
              className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-[#FDE6D2] hover:text-[#5c3a1e]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-black/5 bg-white px-4 py-2.5 text-sm text-[#15161A] shadow-sm outline-none transition-shadow placeholder:text-gray-400 focus:shadow-md";
