"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, ImageIcon, Loader2, Plus, Trash2, Upload, X } from "lucide-react";

export type MediaItem = {
  id: string;
  url: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  altText: string;
  createdAt?: string;
};

type Props = {
  /** Currently selected asset ids */
  selected: string[];
  onChange: (ids: string[]) => void;
  multiple?: boolean;
  label: string;
  accept?: string;
};

/** Upload + reuse picker for images and PDFs. Enforces alt text on upload. */
export function MediaPicker({ selected, onChange, multiple = false, label, accept }: Props) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (!res.ok) throw new Error("Failed to load media");
      const data = await res.json();
      setAssets(data.assets ?? []);
    } catch {
      setError("Could not load the media library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!altText.trim()) {
      setError("Please describe the image first (alt text is required).");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("altText", altText.trim());
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
      }
      setAltText("");
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function toggle(id: string) {
    if (multiple) {
      onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id].slice(0, 10));
    } else {
      onChange(selected.includes(id) ? [] : [id]);
      setOpen(false);
    }
  }

  const previewItems = selected.map((id) => assets.find((a) => a.id === id)).filter(Boolean) as MediaItem[];

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">{label}</p>

      {/* Selected previews */}
      <div className="flex flex-wrap items-center gap-2">
        {previewItems.map((a) => (
          <span key={a.id} className="group relative inline-flex items-center gap-2 rounded-full border border-black/5 bg-white py-1 pl-1 pr-3 shadow-sm">
            {a.mimeType === "application/pdf" ? (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#FDE6D2]"><FileText className="h-4 w-4 text-[#5c3a1e]" /></span>
            ) : (
               
              <img src={a.url} alt={a.altText} className="h-8 w-8 rounded-full object-cover" />
            )}
            <span className="max-w-[140px] truncate text-xs font-semibold">{a.originalFilename}</span>
            <button
              type="button"
              onClick={() => onChange(selected.filter((s) => s !== a.id))}
              aria-label={`Remove ${a.originalFilename}`}
              className="grid h-5 w-5 place-items-center rounded-full text-gray-400 hover:bg-[#FDE6D2] hover:text-[#5c3a1e]"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#15161A] px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" /> {selected.length ? "Change" : "Choose / upload"}
        </button>
      </div>

      {/* Picker dialog */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={`${label} picker`}>
          <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl anim-fade-up">
            <div className="flex items-center justify-between border-b border-black/5 p-5">
              <h2 className="text-base font-black tracking-tight">{label}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#F4F3F0]">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Upload zone */}
            <div className="space-y-2 border-b border-black/5 bg-[#fafaf7] p-5">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Describe the image (alt text, required)
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="e.g. Dashboard screenshot showing regional sales trend"
                  className="h-10 flex-1 rounded-full border border-black/5 bg-white px-4 text-sm outline-none shadow-sm placeholder:text-gray-400"
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept={accept || "image/jpeg,image/png,image/webp,application/pdf"}
                  onChange={(e) => handleUpload(e.target.files)}
                  disabled={uploading}
                  className="hidden"
                  id="media-upload-input"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#D6F824] px-5 text-xs font-bold text-[#141C00] transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading…" : "Upload (JPEG, PNG, WebP, PDF · max 8 MB)"}
                </button>
              </div>
              {error && <p role="alert" className="rounded-xl bg-[#FDE6D2] px-3 py-2 text-xs font-bold text-[#5c3a1e]">{error}</p>}
            </div>

            {/* Library grid */}
            <div className="synkra-scroll flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="grid place-items-center py-10 text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : assets.length === 0 ? (
                <div className="grid place-items-center py-10 text-center">
                  <ImageIcon className="h-8 w-8 text-gray-300" />
                  <p className="mt-3 text-sm font-semibold text-gray-500">The library is empty</p>
                  <p className="mt-1 text-xs text-gray-400">Upload your first image or PDF above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {assets.map((a) => {
                    const isSelected = selected.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggle(a.id)}
                        aria-pressed={isSelected}
                        className={`overflow-hidden rounded-2xl border-2 text-left transition-all ${isSelected ? "border-[#D6F824] shadow-md" : "border-black/5 hover:border-gray-300"}`}
                      >
                        <div className="grid aspect-[4/3] place-items-center bg-[#F4F3F0]">
                          {a.mimeType === "application/pdf" ? (
                            <FileText className="h-8 w-8 text-[#5c3a1e]" />
                          ) : (
                             
                            <img src={a.url} alt={a.altText} loading="lazy" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="truncate text-[11px] font-bold">{a.originalFilename}</p>
                          <p className="truncate text-[10px] text-gray-400">{(a.fileSizeBytes / 1024 / 1024).toFixed(2)} MB · {a.altText || "no alt text"}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-black/5 p-4">
              <p className="text-[11px] text-gray-400">{multiple ? `${selected.length} selected` : "Select one item"}</p>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-[#15161A] px-5 py-2 text-xs font-bold text-white active:scale-95">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Standalone delete button used in the media library table. */
export function MediaDeleteButton({ id, onDelete }: { id: string; onDelete: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onDelete(id)}
      aria-label="Delete file"
      className="grid h-8 w-8 place-items-center rounded-full text-gray-400 transition-colors hover:bg-[#FDE6D2] hover:text-[#5c3a1e]"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
