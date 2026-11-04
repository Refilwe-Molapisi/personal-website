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
  deleteProjectAction,
  duplicateProjectAction,
  saveProjectAction,
  setProjectStatusAction,
} from "@/app/actions/content";
import { PROJECT_TYPES, type ProjectInput } from "@/lib/adminTypes";
import { slugify } from "@/lib/content";

type CategoryOption = { id: string; name: string };
type ProjectOption = { id: string; title: string; status: string };

export type ProjectEditorData = ProjectInput & { id?: string; status?: string };

export function ProjectEditor({
  initial,
  categories,
  projectOptions,
}: {
  initial: ProjectEditorData;
  categories: CategoryOption[];
  projectOptions: ProjectOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(initial.id ? "saved" : null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState<ProjectEditorData>(initial);
  const set = <K extends keyof ProjectEditorData>(key: K, value: ProjectEditorData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initial),
    [form, initial]
  );

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function handleSave(after?: (data: { ok: boolean; id?: string; slug?: string }) => void) {
    setError(null);
    startTransition(async () => {
      const { id, status, ...input } = form;
      const res = await saveProjectAction(input, id);
      if (!res.ok) {
        setError(res.error ?? "Saving failed.");
        return;
      }
      setSavedAt(new Date().toLocaleTimeString());
      if (!id && res.id) {
        // Newly created — move to its edit URL without losing state
        router.replace(`/admin/projects/${res.id}/edit`);
      }
      router.refresh();
      after?.(res);
    });
  }

  function handleStatus(status: "draft" | "published" | "archived") {
    setError(null);
    startTransition(async () => {
      // Ensure latest content is saved first
      const { id, status: _s, ...input } = form;
      const saved = await saveProjectAction(input, id);
      if (!saved.ok) {
        setError(saved.error ?? "Saving failed.");
        return;
      }
      const targetId = id ?? saved.id!;
      const res = await setProjectStatusAction(targetId, status);
      if (!res.ok) {
        setError(res.error ?? "Action failed.");
        return;
      }
      setForm((f) => ({ ...f, status }));
      router.refresh();
    });
  }

  function handleDuplicate() {
    if (!form.id) return;
    startTransition(async () => {
      const res = await duplicateProjectAction(form.id!);
      if (res.ok && res.id) router.push(`/admin/projects/${res.id}/edit`);
    });
  }

  function handleDelete() {
    if (!form.id) return;
    startTransition(async () => {
      const res = await deleteProjectAction(form.id!);
      if (res.ok) router.push("/admin/projects");
      else setError(res.error ?? "Delete failed.");
    });
  }

  const slugPreview = form.slug?.trim() || slugify(form.title || "") || "untitled";
  const status = form.status ?? "draft";

  return (
    <div className="space-y-5 pb-24">
      {/* ── Sticky action bar ── */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-black/5 bg-[#F4F3F0]/90 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/projects" className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm border border-black/5" aria-label="Back to projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${status === "published" ? "bg-[#D6F824] text-[#141C00]" : status === "draft" ? "bg-[#D8E9FE] text-[#1e3a5f]" : "bg-gray-200 text-gray-600"}`}>
            {status}
          </span>
          <span className="hidden truncate text-sm font-bold sm:block">{form.title || "New project"}</span>
          <span className="ml-auto flex flex-wrap items-center gap-2">
            {savedAt && !dirty && <span className="text-[11px] font-semibold text-gray-400">Saved {savedAt !== "saved" ? savedAt : ""}</span>}
            {dirty && <span className="text-[11px] font-semibold text-[#5c3a1e]">Unsaved changes</span>}
            {form.id && status === "published" && (
              <a href={`/projects/${slugPreview}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5">
                <ExternalLink className="h-3.5 w-3.5" /> View live
              </a>
            )}
            {form.id && status !== "published" && (
              <a href={`/projects/${slugPreview}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5" title="Draft preview (admins only)">
                <Eye className="h-3.5 w-3.5" /> Preview
              </a>
            )}
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#15161A] px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
            >
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

      {/* ── Basics ── */}
      <section className="bento space-y-4 p-5 sm:p-6">
        <h2 className="text-base font-black tracking-tight">Basics</h2>
        <Field label="Title *" hint="A clear, specific title.">
          <input value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={200} className={inputCls} placeholder="e.g. Retail Sales Performance Dashboard" />
        </Field>
        <Field label="URL slug" hint={`Public URL: /projects/${slugPreview} — changing it after publishing breaks old links.`}>
          <input value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} className={inputCls} placeholder={slugify(form.title || "auto-generated-from-title")} />
        </Field>
        <Field label="Short summary *" hint="Shown on cards and search results (max 600 chars).">
          <textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} maxLength={600} rows={3} className={inputCls} placeholder="One or two sentences describing what the project analysed and produced." />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project category">
            <select value={form.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value || null)} className={inputCls}>
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Project type" hint="Be truthful about the nature of the work.">
            <select value={form.projectType} onChange={(e) => set("projectType", e.target.value)} className={inputCls}>
              {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Status label" hint="Optional, e.g. Completed / In progress.">
            <input value={form.statusLabel ?? ""} onChange={(e) => set("statusLabel", e.target.value)} className={inputCls} placeholder="Completed" />
          </Field>
          <Field label="Date / period" hint="Free text, e.g. 2026 or Mar – Jun 2026.">
            <input value={form.projectDate ?? ""} onChange={(e) => set("projectDate", e.target.value)} className={inputCls} placeholder="2026" />
          </Field>
        </div>
        <Field label="Tools & methods" hint="Comma-separated, e.g. Power BI, SQL, Excel.">
          <input
            value={(form.tools ?? []).join(", ")}
            onChange={(e) => set("tools", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            className={inputCls}
            placeholder="Power BI, SQL, Excel"
          />
        </Field>
        <Field label="Tags" hint="Comma-separated short keywords.">
          <input
            value={(form.tagNames ?? []).join(", ")}
            onChange={(e) => set("tagNames", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            className={inputCls}
            placeholder="dashboard, retail, synthetic-data"
          />
        </Field>
        <Field label="Synthetic / simulated data notice" hint="If the data is not real, say so here — it shows as a highlighted notice.">
          <input value={form.dataNotice ?? ""} onChange={(e) => set("dataNotice", e.target.value)} className={inputCls} placeholder="This project uses synthetic data generated for demonstration." />
        </Field>
        <MediaPicker
          label="Cover image"
          selected={form.coverImageId ? [form.coverImageId] : []}
          onChange={(ids) => set("coverImageId", ids[0] ?? null)}
          accept="image/jpeg,image/png,image/webp"
        />
      </section>

      {/* ── Narrative sections ── */}
      <section className="bento space-y-5 p-5 sm:p-6">
        <h2 className="text-base font-black tracking-tight">Narrative</h2>
        <Field label="Research question" hint="The question this project answers.">
          <textarea value={form.researchQuestion ?? ""} onChange={(e) => set("researchQuestion", e.target.value)} rows={2} className={inputCls} />
        </Field>
        <MarkdownEditor label="Context & objective" value={form.context ?? ""} onChange={(v) => set("context", v)} />
        <MarkdownEditor label="Methodology & assumptions" value={form.methodology ?? ""} onChange={(v) => set("methodology", v)} />
        <MarkdownEditor label="Analysis steps" value={form.body ?? ""} onChange={(v) => set("body", v)} rows={10} />
        <MarkdownEditor label="Findings" value={form.findings ?? ""} onChange={(v) => set("findings", v)} hint="Tip: one finding per line renders as a clean bullet list on the public page." />
        <MarkdownEditor label="Recommendations & implications" value={form.recommendations ?? ""} onChange={(v) => set("recommendations", v)} />
        <MarkdownEditor label="Limitations & uncertainty" value={form.limitations ?? ""} onChange={(v) => set("limitations", v)} />
        <MarkdownEditor label="What I learned & next steps" value={form.lessons ?? ""} onChange={(v) => set("lessons", v)} />
      </section>

      {/* ── Data section ── */}
      <section className="bento space-y-5 p-5 sm:p-6">
        <h2 className="text-base font-black tracking-tight">Data</h2>
        <MarkdownEditor label="Dataset description" value={form.datasetDescription ?? ""} onChange={(v) => set("datasetDescription", v)} rows={3} />
        <ListEditor
          label="Data source links"
          items={(form.datasetSourceUrls ?? []) as ListPair[]}
          onChange={(items) => set("datasetSourceUrls", items)}
          textPlaceholder="Source name"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Data period"><input value={form.dataPeriod ?? ""} onChange={(e) => set("dataPeriod", e.target.value)} className={inputCls} placeholder="Jan 2024 – Dec 2025" /></Field>
          <Field label="Geographic coverage"><input value={form.geographicCoverage ?? ""} onChange={(e) => set("geographicCoverage", e.target.value)} className={inputCls} placeholder="South Africa" /></Field>
        </div>
        <Field label="Data licence / usage note"><input value={form.licenceNotes ?? ""} onChange={(e) => set("licenceNotes", e.target.value)} className={inputCls} placeholder="e.g. Open data licence, attribution required" /></Field>
        <MarkdownEditor label="Data quality & cleaning notes" value={form.dataCleaningNotes ?? ""} onChange={(v) => set("dataCleaningNotes", v)} rows={3} />
        <MediaPicker
          label="Supporting files (reports, sample datasets)"
          selected={form.supportingFiles ?? []}
          onChange={(ids) => set("supportingFiles", ids)}
          multiple
        />
      </section>

      {/* ── Links, references & SEO ── */}
      <section className="bento space-y-5 p-5 sm:p-6">
        <h2 className="text-base font-black tracking-tight">Links, references & SEO</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Code repository URL"><input value={form.repositoryUrl ?? ""} onChange={(e) => set("repositoryUrl", e.target.value)} className={inputCls} placeholder="https://github.com/…" /></Field>
          <Field label="Dashboard URL" hint="External dashboard link (a fallback if it cannot be embedded)."><input value={form.dashboardUrl ?? ""} onChange={(e) => set("dashboardUrl", e.target.value)} className={inputCls} placeholder="https://app.powerbi.com/…" /></Field>
        </div>
        <ListEditor label="References / citations" items={(form.references ?? []) as ListPair[]} onChange={(items) => set("references", items)} textPlaceholder="Citation text" />
        <Field label="Related projects" hint="Ctrl/Cmd-click to select up to 6. Only published ones appear publicly.">
          <select
            multiple
            value={form.relatedProjectIds ?? []}
            onChange={(e) => set("relatedProjectIds", Array.from(e.target.selectedOptions).map((o) => o.value).slice(0, 6))}
            className={`${inputCls} h-28 rounded-2xl`}
          >
            {projectOptions.filter((p) => p.id !== form.id).map((p) => (
              <option key={p.id} value={p.id}>{p.title} ({p.status})</option>
            ))}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO meta title" hint="Defaults to the project title."><input value={form.metaTitle ?? ""} onChange={(e) => set("metaTitle", e.target.value)} maxLength={70} className={inputCls} /></Field>
          <Field label="SEO meta description" hint="Defaults to the summary."><input value={form.metaDescription ?? ""} onChange={(e) => set("metaDescription", e.target.value)} maxLength={160} className={inputCls} /></Field>
        </div>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2.5 text-sm font-semibold">
            <input type="checkbox" checked={Boolean(form.isFeatured)} onChange={(e) => set("isFeatured", e.target.checked)} className="h-4 w-4 accent-[#15161A]" />
            Featured on home page
          </label>
          <label className="flex items-center gap-2.5 text-sm font-semibold">
            Display order
            <input type="number" value={form.displayOrder ?? 0} onChange={(e) => set("displayOrder", Number(e.target.value))} className="h-9 w-20 rounded-full border border-black/5 bg-white px-3 text-sm shadow-sm outline-none" />
          </label>
        </div>
      </section>

      {/* ── Danger zone ── */}
      {form.id && (
        <section className="bento border border-red-100 p-5 sm:p-6">
          <h2 className="text-base font-black tracking-tight text-[#8a2c2c]">Danger zone</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={handleDuplicate} disabled={pending} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5 disabled:opacity-60">
              <Copy className="h-3.5 w-3.5" /> Duplicate as starting point
            </button>
            {status !== "archived" ? (
              <button type="button" onClick={() => handleStatus("archived")} disabled={pending} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5 disabled:opacity-60">
                <Archive className="h-3.5 w-3.5" /> Archive
              </button>
            ) : (
              <button type="button" onClick={() => handleStatus("draft")} disabled={pending} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm border border-black/5 transition-transform hover:-translate-y-0.5 disabled:opacity-60">
                <Undo2 className="h-3.5 w-3.5" /> Restore from archive
              </button>
            )}
            {!confirmDelete ? (
              <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 rounded-full bg-[#FDE6D2] px-4 py-2 text-xs font-bold text-[#5c3a1e] transition-transform hover:-translate-y-0.5">
                <Trash2 className="h-3.5 w-3.5" /> Delete…
              </button>
            ) : (
              <span className="inline-flex flex-wrap items-center gap-2 rounded-full bg-[#FDE6D2] px-4 py-2 text-xs font-bold text-[#5c3a1e]">
                Permanently delete this project and its revision history?
                <button type="button" onClick={handleDelete} disabled={pending} className="rounded-full bg-[#8a2c2c] px-3.5 py-1.5 text-[11px] font-bold text-white disabled:opacity-60">
                  Yes, delete
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold">
                  Cancel
                </button>
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
