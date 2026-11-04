"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, Save, Trash2 } from "lucide-react";
import { deleteMediaAction, updateMediaAction } from "@/app/actions/content";

export type MediaRow = {
  id: string;
  url: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  altText: string;
  caption: string | null;
  createdAt: string;
};

export function MediaLibrary({ assets }: { assets: MediaRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<MediaRow | null>(null);

  const filtered = useMemo(
    () => assets.filter((a) => a.originalFilename.toLowerCase().includes(filter.toLowerCase()) || a.mimeType.includes(filter.toLowerCase())),
    [assets, filter]
  );

  function copyUrl(id: string) {
    const asset = assets.find((a) => a.id === id);
    if (!asset) return;
    const abs = `${window.location.origin}${asset.url}`;
    navigator.clipboard.writeText(abs).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  function remove(id: string) {
    if (!window.confirm("Delete this file? This cannot be undone.")) return;  
    setError(null);
    startTransition(async () => {
      const res = await deleteMediaAction(id);
      if (!res.ok) setError(res.error ?? "Delete failed.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by filename or type…"
          aria-label="Filter media"
          className="h-11 w-full max-w-sm rounded-full border border-black/5 bg-white px-4 text-sm shadow-sm outline-none placeholder:text-gray-400"
        />
        <p className="text-xs font-semibold text-gray-400">{assets.length} file{assets.length === 1 ? "" : "s"}</p>
      </div>

      {error && <p role="alert" className="rounded-2xl bg-[#FDE6D2] px-4 py-3 text-xs font-bold text-[#5c3a1e]">{error}</p>}

      {editing && (
        <div className="bento space-y-3 p-5">
          <h2 className="text-sm font-black">Edit details — {editing.originalFilename}</h2>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">Alt text *</span>
            <input value={editing.altText} onChange={(e) => setEditing({ ...editing, altText: e.target.value })} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">Caption / label</span>
            <input value={editing.caption ?? ""} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} className={inputCls} />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(async () => {
                await updateMediaAction(editing.id, editing.altText, editing.caption ?? "");
                setEditing(null);
                router.refresh();
              })}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#D6F824] px-5 py-2.5 text-xs font-bold text-[#141C00] disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save details
            </button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-full bg-white px-4 py-2.5 text-xs font-bold shadow-sm border border-black/5">Cancel</button>
          </div>
        </div>
      )}

      {assets.length === 0 ? (
        <div className="bento p-10 text-center">
          <p className="text-sm font-bold text-gray-500">No files yet</p>
          <p className="mt-1 text-xs text-gray-400">Upload images and PDFs from any project or article editor.</p>
        </div>
      ) : (
        <div className="bento divide-y divide-black/5">
          {filtered.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-4">
              {a.mimeType === "application/pdf" ? (
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#FDE6D2] text-xs font-black text-[#5c3a1e]">PDF</span>
              ) : (
                 
                <img src={a.url} alt={a.altText || a.originalFilename} loading="lazy" className="h-11 w-11 shrink-0 rounded-2xl object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{a.originalFilename}</p>
                <p className="truncate text-[11px] text-gray-400">
                  {a.mimeType} · {(a.fileSizeBytes / 1024 / 1024).toFixed(2)} MB · {a.altText || "no alt text"}
                </p>
              </div>
              <button type="button" onClick={() => setEditing(a)} className="rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5">
                Details
              </button>
              <button
                type="button"
                onClick={() => copyUrl(a.id)}
                aria-label={`Copy URL for ${a.originalFilename}`}
                title="Copy public URL"
                className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-[#F4F3F0] hover:text-[#15161A]"
              >
                {copied === a.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => remove(a.id)}
                disabled={pending}
                aria-label={`Delete ${a.originalFilename}`}
                className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-[#FDE6D2] hover:text-[#5c3a1e] disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-black/5 bg-white px-4 py-2.5 text-sm text-[#15161A] shadow-sm outline-none transition-shadow placeholder:text-gray-400 focus:shadow-md";
