"use client";

import { Plus, Trash2 } from "lucide-react";

export type ListPair = { text: string; url?: string };

/** Editor for lists of {text, url} pairs — used for references and data sources. */
export function ListEditor({
  label,
  items,
  onChange,
  urlPlaceholder = "https://…",
  textPlaceholder = "Description or citation",
}: {
  label: string;
  items: ListPair[];
  onChange: (items: ListPair[]) => void;
  urlPlaceholder?: string;
  textPlaceholder?: string;
}) {
  function update(i: number, patch: Partial<ListPair>) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-xs text-gray-400">No entries yet.</p>}
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-1.5 rounded-2xl border border-black/5 bg-white p-2.5 shadow-sm sm:flex-row">
            <input
              value={item.text}
              onChange={(e) => update(i, { text: e.target.value })}
              placeholder={textPlaceholder}
              aria-label={`${label} entry ${i + 1} description`}
              className="h-9 flex-1 rounded-full bg-[#F4F3F0] px-3.5 text-xs outline-none placeholder:text-gray-400"
            />
            <input
              value={item.url ?? ""}
              onChange={(e) => update(i, { url: e.target.value })}
              placeholder={urlPlaceholder}
              aria-label={`${label} entry ${i + 1} link`}
              className="h-9 flex-1 rounded-full bg-[#F4F3F0] px-3.5 text-xs outline-none placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              aria-label={`Remove entry ${i + 1}`}
              className="mx-auto grid h-9 w-9 shrink-0 place-items-center rounded-full text-gray-400 transition-colors hover:bg-[#FDE6D2] hover:text-[#5c3a1e]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, { text: "", url: "" }])}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-3.5 w-3.5" /> Add entry
        </button>
      </div>
    </div>
  );
}
