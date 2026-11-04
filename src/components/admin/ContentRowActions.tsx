"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Copy,
  Eye,
  MoreHorizontal,
  Pencil,
  Rocket,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  deleteArticleAction,
  deleteProjectAction,
  duplicateArticleAction,
  duplicateProjectAction,
  setArticleStatusAction,
  setProjectStatusAction,
} from "@/app/actions/content";

type Props = {
  kind: "project" | "article";
  id: string;
  status: string;
  slug: string;
};

/** Row actions dropdown: edit, preview, publish lifecycle, duplicate, delete. */
export function ContentRowActions({ kind, id, status, slug }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string; id?: string }>, close = true) {
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        alert(res.error ?? "Action failed.");  
        return;
      }
      if (close) setOpen(false);
      router.refresh();
    });
  }

  const items: Array<{ label: string; icon: React.ComponentType<{ className?: string }>; run: () => void; danger?: boolean }> = [];

  items.push({
    label: "Edit",
    icon: Pencil,
    run: () => router.push(`/admin/${kind === "project" ? "projects" : "research"}/${id}/edit`),
  });
  items.push({
    label: status === "published" ? "View live" : "Preview",
    icon: Eye,
    run: () => window.open(`${kind === "project" ? "/projects" : "/research"}/${slug}`, "_blank"),
  });
  if (status !== "published")
    items.push({ label: "Publish", icon: Rocket, run: () => run(() => (kind === "project" ? setProjectStatusAction(id, "published") : setArticleStatusAction(id, "published"))) });
  if (status === "published")
    items.push({ label: "Unpublish", icon: Undo2, run: () => run(() => (kind === "project" ? setProjectStatusAction(id, "draft") : setArticleStatusAction(id, "draft"))) });
  if (status !== "archived")
    items.push({ label: "Archive", icon: Archive, run: () => run(() => (kind === "project" ? setProjectStatusAction(id, "archived") : setArticleStatusAction(id, "archived"))) });
  else
    items.push({ label: "Restore from archive", icon: ArchiveRestore, run: () => run(() => (kind === "project" ? setProjectStatusAction(id, "draft") : setArticleStatusAction(id, "draft"))) });
  items.push({
    label: "Duplicate",
    icon: Copy,
    run: () => {
      startTransition(async () => {
        const res = kind === "project" ? await duplicateProjectAction(id) : await duplicateArticleAction(id);
        if (res.ok && res.id) {
          setOpen(false);
          router.push(`/admin/${kind === "project" ? "projects" : "research"}/${res.id}/edit`);
        }
      });
    },
  });
  items.push({ label: "Delete permanently", icon: Trash2, run: () => setConfirmDelete(true), danger: true });

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Actions for this ${kind}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid h-8 w-8 place-items-center rounded-full text-gray-400 transition-colors hover:bg-[#F4F3F0] hover:text-[#15161A]"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-40 w-52 overflow-hidden rounded-2xl border border-black/5 bg-white py-1.5 shadow-xl anim-fade-in">
            {confirmDelete ? (
              <div className="px-3.5 py-2">
                <p className="text-xs font-bold text-[#5c3a1e]">Delete permanently? This cannot be undone.</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => (kind === "project" ? deleteProjectAction(id) : deleteArticleAction(id)))}
                    className="flex-1 rounded-full bg-[#8a2c2c] px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-60"
                  >
                    {pending ? "Deleting…" : "Delete"}
                  </button>
                  <button type="button" onClick={() => { setConfirmDelete(false); setOpen(false); }} className="flex-1 rounded-full bg-[#F4F3F0] px-3 py-1.5 text-[11px] font-bold">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled={pending}
                  onClick={item.run}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-semibold transition-colors hover:bg-[#F4F3F0] disabled:opacity-50 ${item.danger ? "text-[#8a2c2c]" : "text-[#15161A]"}`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
