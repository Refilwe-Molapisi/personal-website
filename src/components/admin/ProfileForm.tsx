"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { saveProfileAction } from "@/app/actions/content";

export type ProfileData = {
  displayName: string;
  headline: string;
  intro: string;
  biography: string;
  educationSummary: string;
  professionalInterests: string;
  linkedinUrl: string;
  publicEmail: string;
  homeIntro: string;
  footerText: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
};

export function ProfileForm({ initial }: { initial: ProfileData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<ProfileData>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof ProfileData>(k: K, v: ProfileData[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  };

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await saveProfileAction(form);
      if (!res.ok) {
        setError(res.error ?? "Save failed.");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {error && <p role="alert" className="rounded-2xl bg-[#FDE6D2] px-4 py-3 text-xs font-bold text-[#5c3a1e]">{error}</p>}
      {saved && <p role="status" className="rounded-2xl bg-[#D6F824] px-4 py-3 text-xs font-bold text-[#141C00]">Saved — public pages will reflect this immediately.</p>}

      <section className="bento space-y-4 p-5 sm:p-6">
        <h2 className="text-base font-black tracking-tight">Professional profile</h2>
        <Field label="Display name *"><input value={form.displayName} onChange={(e) => set("displayName", e.target.value)} className={inputCls} /></Field>
        <Field label="Professional headline" hint="Shown under your name across the site.">
          <input value={form.headline} onChange={(e) => set("headline", e.target.value)} className={inputCls} placeholder="Final-year BCom Economics student" />
        </Field>
        <Field label="Short introduction" hint="Used in the admin hero and as fallback for the home intro.">
          <textarea value={form.intro} onChange={(e) => set("intro", e.target.value)} rows={3} className={inputCls} />
        </Field>
        <Field label="Biography" hint="Markdown is not rendered here — plain paragraphs, blank line between them.">
          <textarea value={form.biography} onChange={(e) => set("biography", e.target.value)} rows={7} className={inputCls} />
        </Field>
        <Field label="Education summary" hint="Degree/programme and current study status, stated accurately.">
          <textarea value={form.educationSummary} onChange={(e) => set("educationSummary", e.target.value)} rows={2} className={inputCls} />
        </Field>
        <Field label="Professional interests" hint="One per line — shown as chips on the About page.">
          <textarea value={form.professionalInterests} onChange={(e) => set("professionalInterests", e.target.value)} rows={4} className={inputCls} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="LinkedIn URL" hint="Shown prominently across the site.">
            <input value={form.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} className={inputCls} placeholder="https://www.linkedin.com/in/…" />
          </Field>
          <Field label="Public email (optional)" hint="Only add an address you are happy to make public.">
            <input value={form.publicEmail} onChange={(e) => set("publicEmail", e.target.value)} className={inputCls} placeholder="name@example.com" />
          </Field>
        </div>
      </section>

      <section className="bento space-y-4 p-5 sm:p-6">
        <h2 className="text-base font-black tracking-tight">Home page & footer</h2>
        <Field label="Home intro" hint="The paragraph in the home hero card.">
          <textarea value={form.homeIntro} onChange={(e) => set("homeIntro", e.target.value)} rows={3} className={inputCls} />
        </Field>
        <Field label="Footer text" hint="Short descriptor shown in the footer.">
          <input value={form.footerText} onChange={(e) => set("footerText", e.target.value)} className={inputCls} />
        </Field>
      </section>

      <section className="bento space-y-4 p-5 sm:p-6">
        <h2 className="text-base font-black tracking-tight">Default SEO</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default meta title"><input value={form.defaultMetaTitle} onChange={(e) => set("defaultMetaTitle", e.target.value)} maxLength={70} className={inputCls} /></Field>
          <Field label="Default meta description"><input value={form.defaultMetaDescription} onChange={(e) => set("defaultMetaDescription", e.target.value)} maxLength={160} className={inputCls} /></Field>
        </div>
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-[#15161A] px-6 py-3 text-sm font-bold text-white shadow-xl transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save settings
        </button>
      </div>
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
