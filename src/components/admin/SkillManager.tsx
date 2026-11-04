"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { deleteSkillAction, saveSkillAction } from "@/app/actions/content";
import { SKILL_STATUSES, SKILL_STATUS_CLASSES } from "@/lib/content";

export type SkillRow = {
  id: string;
  name: string;
  groupName: string;
  statusLabel: string;
  description: string;
  evidenceUrl: string | null;
  displayOrder: number;
  isVisible: boolean;
};

type Draft = Omit<SkillRow, "id" | "isVisible"> & { id?: string; isVisible: boolean };

const emptyDraft: Draft = {
  name: "",
  groupName: "Data analysis and BI",
  statusLabel: "Learning",
  description: "",
  evidenceUrl: "",
  displayOrder: 0,
  isVisible: true,
};

const SUGGESTED_GROUPS = [
  "Data analysis and BI",
  "Programming and databases",
  "Statistics and quantitative methods",
  "Business and commercial analysis",
  "Research and writing",
  "Risk and compliance",
];

export function SkillManager({ skills }: { skills: SkillRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const groups = [...new Set(skills.map((s) => s.groupName))];

  function save() {
    if (!draft) return;
    setError(null);
    startTransition(async () => {
      const res = await saveSkillAction({
        id: draft.id,
        name: draft.name,
        groupName: draft.groupName,
        statusLabel: draft.statusLabel,
        description: draft.description,
        evidenceUrl: draft.evidenceUrl || undefined,
        displayOrder: draft.displayOrder,
        isVisible: draft.isVisible,
      });
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
        <p className="text-sm text-gray-500">{skills.length} skills · toggle visibility without deleting</p>
        <button
          type="button"
          onClick={() => setDraft({ ...emptyDraft, displayOrder: skills.length + 1 })}
          className="inline-flex items-center gap-2 rounded-full bg-[#15161A] px-4 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add skill
        </button>
      </div>

      {error && <p role="alert" className="rounded-2xl bg-[#FDE6D2] px-4 py-3 text-xs font-bold text-[#5c3a1e]">{error}</p>}

      {/* Edit / add form */}
      {draft && (
        <div className="bento space-y-3.5 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black tracking-tight">{draft.id ? "Edit skill" : "New skill"}</h2>
            <button type="button" onClick={() => setDraft(null)} aria-label="Cancel" className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#F4F3F0]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">Name *</span>
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputCls} placeholder="e.g. Power BI" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">Group</span>
              <input list="skill-groups" value={draft.groupName} onChange={(e) => setDraft({ ...draft, groupName: e.target.value })} className={inputCls} />
              <datalist id="skill-groups">
                {SUGGESTED_GROUPS.map((g) => <option key={g} value={g} />)}
              </datalist>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">Status (self-assessed)</span>
              <select value={draft.statusLabel} onChange={(e) => setDraft({ ...draft, statusLabel: e.target.value })} className={inputCls}>
                {SKILL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">Display order</span>
              <input type="number" value={draft.displayOrder} onChange={(e) => setDraft({ ...draft, displayOrder: Number(e.target.value) })} className={inputCls} />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">Short explanation</span>
            <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={2} className={inputCls} placeholder="What you can actually do with it." />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">Evidence link (optional)</span>
            <input value={draft.evidenceUrl ?? ""} onChange={(e) => setDraft({ ...draft, evidenceUrl: e.target.value })} className={inputCls} placeholder="https://… (project or repository)" />
          </label>
          <label className="flex items-center gap-2.5 text-sm font-semibold">
            <input type="checkbox" checked={draft.isVisible} onChange={(e) => setDraft({ ...draft, isVisible: e.target.checked })} className="h-4 w-4 accent-[#15161A]" />
            Visible on public skills page
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={pending} className="inline-flex items-center gap-1.5 rounded-full bg-[#D6F824] px-5 py-2.5 text-xs font-bold text-[#141C00] transition-transform hover:-translate-y-0.5 disabled:opacity-60">
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save skill
            </button>
            <button type="button" onClick={() => setDraft(null)} className="rounded-full bg-white px-4 py-2.5 text-xs font-bold shadow-sm border border-black/5">Cancel</button>
          </div>
        </div>
      )}

      {/* Grouped list */}
      {groups.map((group) => (
        <section key={group}>
          <h2 className="mb-2.5 text-sm font-black tracking-tight text-gray-500">{group}</h2>
          <div className="bento divide-y divide-black/5">
            {skills.filter((s) => s.groupName === group).map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-4">
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${SKILL_STATUS_CLASSES[s.statusLabel] ?? "bg-gray-200"}`}>{s.statusLabel}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{s.name} {!s.isVisible && <span className="ml-1 text-[10px] font-bold text-gray-400">(hidden)</span>}</p>
                  {s.description && <p className="truncate text-[11px] text-gray-400">{s.description}</p>}
                </div>
                <button
                  type="button"
                  aria-label={s.isVisible ? `Hide ${s.name}` : `Show ${s.name}`}
                  onClick={() => startTransition(async () => { await saveSkillAction({ id: s.id, name: s.name, groupName: s.groupName, statusLabel: s.statusLabel, description: s.description, evidenceUrl: s.evidenceUrl ?? undefined, displayOrder: s.displayOrder, isVisible: !s.isVisible }); router.refresh(); })}
                  className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-[#F4F3F0] hover:text-[#15161A]"
                >
                  {s.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button type="button" aria-label={`Edit ${s.name}`} onClick={() => setDraft({ ...s })} className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-[#F4F3F0] hover:text-[#15161A]">
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${s.name}`}
                  onClick={() => {
                    if (!window.confirm(`Delete skill "${s.name}"?`)) return;  
                    startTransition(async () => { await deleteSkillAction(s.id); router.refresh(); });
                  }}
                  className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-[#FDE6D2] hover:text-[#5c3a1e]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-black/5 bg-white px-4 py-2.5 text-sm text-[#15161A] shadow-sm outline-none transition-shadow placeholder:text-gray-400 focus:shadow-md";
