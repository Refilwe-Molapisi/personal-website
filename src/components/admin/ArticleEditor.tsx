"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  Copy,
  ExternalLink,
  Eye,
  Loader2,
  Rocket,
  Save,
  Trash2,
  Undo2,
} from "lucide-react";
import { MarkdownEditor } from "./MarkdownEditor";
import { MediaPicker } from "./MediaPicker";
import { ListEditor, type ListPair } from "./ListEditor";
import {
  deleteArticleAction,
  duplicateArticleAction,
  saveArticleAction,
  setArticleStatusAction,
} from "@/app/actions/content";
import { ARTICLE_TYPES, type ArticleInput } from "@/lib/adminTypes";
import { slugify } from "@/lib/content";

type CategoryOption = { id: string; name: string };
export type ArticleEditorData = ArticleInput & { id?: string; status?: string };

export function ArticleEditor({
  initial,
  categories,
}: {
  initial: ArticleEditorData;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(initial.id ? "saved" : null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState<ArticleEditorData>(initial);

  const set = <K extends keyof ArticleEditorData>(key: K, value: ArticleEditorData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const { id, status, ...input } = form;
      const res = await saveArticleAction(input, id);
      if (!res.ok) {
        setError(res.error ?? "Saving failed.");
        return;
      }
      setSavedAt(new Date().toLocaleTimeString());
      if (!id && res.id) router.replace(`/admin/research/${res.id}/edit`);
      router.refresh();
    });
  }

  function handleStatus(status: "draft" | "published" | "archived") {
    setError(null);
    startTransition(async () => {
      const { id, status: _s, ...input } = form;
      const saved = await saveArticleAction(input, id);
      if (!saved.ok) {
        setError(saved.error ?? "Saving failed.");
        return;
      }
      const res = await setArticleStatusAction(id ?? saved.id!, status);
      if (!res.ok) {
        setError(res.error ?? "Action failed.");
        return;
      }
      setForm((f) => ({ ...f, status }));
      router.refresh();
    });
  }

  const slugPreview = form.slug?.trim() || slugify(form.title || "") || "untitled";
  const status = form.status ?? "draft";

  return (
    <div className="space-y-5 pb-24">
      <div className="sticky top-0 z-20 -mx-4 border-b border-black/5 bg-[#F4F3F0]/90 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/research" className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm border border-black/5" aria-label="Back to research">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${status === "published" ? "bg-[#D6F824] text-[#141C00]" : status === "draft" ? "bg-[#D8E9FE] text-[#1e3a5f]" : "bg-gray-200 text-gray-600"}`}>
            {status}
          </span>
          <span className="hidden truncate text-sm font-bold sm:block">{form.title || "New article"}</span>
          <span className="ml-auto flex flex-wrap items-center gap-2">
            {savedAt && !dirty && <span className="text-[11px] font-semibold text-gray-400">Saved</span>}
            {dirty && <span className="text-[11px] font-semibold text-[#5c3a1e]">Unsaved changes</span>}
            {form.id && (
              <a href={`/research/${slugPreview}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5">
                {status === "published" ? <ExternalLink className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {status === "published" ? "View live" : "Preview"}
              </a>
            )}
            <button type="button" onClick={handleSave} disabled={pending} className="inline-flex items-center gap-1.5 rounded-full bg-[#15161A] px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60">
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
            </button>
            {status !== "published" ? (
              <button type="button" onClick={() => handleStatus("published")} disabled={pending} className="inline-flex items-center gap-1.5 rounded-full bg-[#D6F824] px-4 py-2 text-xs font-bold text-[#141C00] transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60">
                <Rocket className="h-3.5 w-3.5" /> Publish
              </button>
            ) : (
              <button type="button" onClick={() => handleStatus("draft")} disabled={pending} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5">
                <Undo2 className="h-3.5 w-3.5" /> Unpublish
              </button>
            )}
          </span>
        </div>
        {error && <p role="alert" className="mt-2 rounded-xl bg-[#FDE6D2] px-3.5 py-2 text-xs font-bold text-[#5c3a1e]">{error}</p>}
      </div>

      <section className="bento space-y-4 p-5 sm:p-6">
        <h2 className="text-base font-black tracking-tight">Basics</h2>
        <Field label="Title *">
          <input value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={200} className={inputCls} />
        </Field>
        <Field label="URL slug" hint={`Public URL: /research/${slugPreview} — changing it after publishing breaks old links.`}>
          <input value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} className={inputCls} placeholder={slugify(form.title || "auto")} />
        </Field>
        <Field label="Summary / abstract *" hint="Max 600 characters.">
          <textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} maxLength={600} rows={3} className={inputCls} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Topic / category">
            <select value={form.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value || null)} className={inputCls}>
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Content type">
            <select value={form.contentType} onChange={(e) => set("contentType", e.target.value)} className={inputCls}>
              {ARTICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Tags" hint="Comma-separated.">
          <input value={(form.tagNames ?? []).join(", ")} onChange={(e) => set("tagNames", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className={inputCls} placeholder="method, sql" />
        </Field>
        <MediaPicker label="Cover image" selected={form.coverImageId ? [form.coverImageId] : []} onChange={(ids) => set("coverImageId", ids[0] ?? null)} accept="image/jpeg,image/png,image/webp" />
        <MediaPicker label="Downloadable PDF (optional)" selected={form.pdfAssetId ? [form.pdfAssetId] : []} onChange={(ids) => set("pdfAssetId", ids[0] ?? null)} accept="application/pdf" />
      </section>

      <section className="bento space-y-5 p-5 sm:p-6">
        <h2 className="text-base font-black tracking-tight">Article body</h2>
        <MarkdownEditor label="Full article (markdown)" value={form.body} onChange={(v) => set("body", v)} rows={16} required />
      </section>

      <section className="bento space-y-5 p-5 sm:p-6">
        <h2 className="text-base font-black tracking-tight">Structured sections</h2>
        <Field label="Research question"><textarea value={form.researchQuestion ?? ""} onChange={(e) => set("researchQuestion", e.target.value)} rows={2} className={inputCls} /></Field>
        <MarkdownEditor label="Data & methodology" value={form.methodology ?? ""} onChange={(v) => set("methodology", v)} rows={4} />
        <MarkdownEditor label="Main findings" value={form.findings ?? ""} onChange={(v) => set("findings", v)} rows={4} />
        <MarkdownEditor label="Limitations & caveats" value={form.limitations ?? ""} onChange={(v) => set("limitations", v)} rows={3} />
        <ListEditor label="Sources & references" items={(form.references ?? []) as ListPair[]} onChange={(items) => set("references", items)} textPlaceholder="Citation text" />
      </section>

      <section className="bento space-y-4 p-5 sm:p-6">
        <h2 className="text-base font-black tracking-tight">SEO & display</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO meta title"><input value={form.metaTitle ?? ""} onChange={(e) => set("metaTitle", e.target.value)} maxLength={70} className={inputCls} /></Field>
          <Field label="SEO meta description"><input value={form.metaDescription ?? ""} onChange={(e) => set("metaDescription", e.target.value)} maxLength={160} className={inputCls} /></Field>
        </div>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2.5 text-sm font-semibold">
            <input type="checkbox" checked={Boolean(form.isFeatured)} onChange={(e) => set("isFeatured", e.target.checked)} className="h-4 w-4 accent-[#15161A]" />
            Featured article
          </label>
          <label className="flex items-center gap-2.5 text-sm font-semibold">
            Display order
            <input type="number" value={form.displayOrder ?? 0} onChange={(e) => set("displayOrder", Number(e.target.value))} className="h-9 w-20 rounded-full border border-black/5 bg-white px-3 text-sm shadow-sm outline-none" />
          </label>
        </div>
      </section>

      {form.id && (
        <section className="bento border border-red-100 p-5 sm:p-6">
          <h2 className="text-base font-black tracking-tight text-[#8a2c2c]">Danger zone</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => startTransition(async () => {
              const res = await duplicateArticleAction(form.id!);
              if (res.ok && res.id) router.push(`/admin/research/${res.id}/edit`);
            })} disabled={pending} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5 disabled:opacity-60">
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </button>
            {status !== "archived" ? (
              <button type="button" onClick={() => handleStatus("archived")} disabled={pending} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5 disabled:opacity-60">
                <Archive className="h-3.5 w-3.5" /> Archive
              </button>
            ) : (
              <button type="button" onClick={() => handleStatus("draft")} disabled={pending} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5 disabled:opacity-60">
                <Undo2 className="h-3.5 w-3.5" /> Restore
              </button>
            )}
            {!confirmDelete ? (
              <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 rounded-full bg-[#FDE6D2] px-4 py-2 text-xs font-bold text-[#5c3a1e] transition-transform hover:-translate-y-0.5">
                <Trash2 className="h-3.5 w-3.5" /> Delete…
              </button>
            ) : (
              <span className="inline-flex flex-wrap items-center gap-2 rounded-full bg-[#FDE6D2] px-4 py-2 text-xs font-bold text-[#5c3a1e]">
                Permanently delete this article?
                <button type="button" onClick={() => startTransition(async () => {
                  const res = await deleteArticleAction(form.id!);
                  if (res.ok) router.push("/admin/research");
                  else setError(res.error ?? "Delete failed.");
                })} disabled={pending} className="rounded-full bg-[#8a2c2c] px-3.5 py-1.5 text-[11px] font-bold text-white disabled:opacity-60">Yes, delete</button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold">Cancel</button>
              </span>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-black/5 bg-white px-4 py-2.5 text-sm text-[#15161A] shadow-sm outline-none transition-shadow placeholder:text-gray-400 focus:shadow-md";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      {children}
      {hint && <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{hint}</p>}
    </div>
  );
}
