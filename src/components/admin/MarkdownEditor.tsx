"use client";

import { useState } from "react";
import { Bold, Code, Eye, Heading2, Italic, Link2, List, ListOrdered, Minus, PencilLine, Quote, Table } from "lucide-react";
import { Prose } from "@/components/synkra/Prose";

type Props = {
  value: string;
  onChange: (v: string) => void;
  label: string;
  hint?: string;
  rows?: number;
  required?: boolean;
};

/** Lightweight markdown editor: toolbar, live preview, word count. */
export function MarkdownEditor({ value, onChange, label, hint, rows = 8, required }: Props) {
  const [preview, setPreview] = useState(false);

  function insert(before: string, after = "", placeholder = "text") {
    const el = document.getElementById(`md-${label}`) as HTMLTextAreaElement | null;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  const tools = [
    { icon: Bold, title: "Bold", run: () => insert("**", "**") },
    { icon: Italic, title: "Italic", run: () => insert("*", "*") },
    { icon: Heading2, title: "Heading", run: () => insert("## ", "", "Heading") },
    { icon: List, title: "Bullet list", run: () => insert("- ", "", "item") },
    { icon: ListOrdered, title: "Numbered list", run: () => insert("1. ", "", "item") },
    { icon: Quote, title: "Quote", run: () => insert("> ", "", "quote") },
    { icon: Link2, title: "Link", run: () => insert("[", "](https://)", "link text") },
    { icon: Code, title: "Code block", run: () => insert("\n```js\n", "\n```\n", "code") },
    { icon: Table, title: "Table", run: () => insert("\n| Column | Column |\n| --- | --- |\n| ", " | value |\n", "value") },
    { icon: Minus, title: "Divider", run: () => insert("\n---\n") },
  ];

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={`md-${label}`} className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-gray-400">{words} words · markdown</span>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            aria-pressed={preview}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${preview ? "bg-[#15161A] text-white" : "bg-[#F4F3F0] text-gray-500 hover:text-[#15161A]"}`}
          >
            {preview ? <PencilLine className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      {!preview && (
        <div className="mb-1.5 flex flex-wrap gap-1 rounded-2xl border border-black/5 bg-[#fafaf7] p-1.5">
          {tools.map((t) => (
            <button
              key={t.title}
              type="button"
              title={t.title}
              aria-label={t.title}
              onClick={t.run}
              className="grid h-7 w-7 place-items-center rounded-lg text-gray-500 transition-colors hover:bg-white hover:text-[#15161A] hover:shadow-sm"
            >
              <t.icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      )}

      {preview ? (
        <div className="min-h-[120px] rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          {value.trim() ? <Prose content={value} /> : <p className="text-xs text-gray-400">Nothing to preview yet.</p>}
        </div>
      ) : (
        <textarea
          id={`md-${label}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={hint || "Write in markdown — headings, lists, links, tables and code are supported."}
          className="w-full rounded-2xl border border-black/5 bg-white p-4 text-sm leading-relaxed text-[#15161A] shadow-sm outline-none transition-shadow placeholder:text-gray-400 focus:shadow-md"
        />
      )}
      {hint && preview && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}
