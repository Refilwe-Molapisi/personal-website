import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Linkedin, Mail, Target } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import {
  buildPersonSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  FAQ_QUESTIONS,
  JsonLdScript,
} from "@/lib/seo";
import { Prose } from "@/components/synkra/Prose";
import { Chip } from "@/components/synkra/bento";
import { Reveal } from "@/components/synkra/Reveal";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = settings?.displayName || "Refilwe Molapisi";
  return {
    title: "About",
    description: `About ${name}: ${settings?.headline || "final-year BCom Economics student"} — background, interests, analytical approach and answers to common questions.`,
    alternates: { canonical: "/about" },
    openGraph: {
      title: `About ${name}`,
      description: `Background, career directions and analytical approach of ${name}.`,
      type: "profile",
      url: "/about",
    },
  };
}

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const interests = (settings?.professionalInterests || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const linkedinUrl = settings?.linkedinUrl || "";
  const name = settings?.displayName || "Refilwe Molapisi";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@graph": [
            buildPersonSchema(settings),
            buildBreadcrumbSchema([
              { name: "Home", url: "/" },
              { name: "About", url: "/about" },
            ]),
            buildFaqSchema(),
          ],
        }}
      />

      <Reveal>
        <header className="bento bento-lg bg-[#15161A] p-6 text-white sm:p-10">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#D6F824] text-xl font-black text-[#141C00]">RM</div>
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{settings?.displayName || "Refilwe Molapisi"}</h1>
              <p className="mt-1 text-xs text-white/60 sm:text-sm">{settings?.headline || "Final-year BCom Economics student"}</p>
            </div>
          </div>
        </header>
      </Reveal>

      <Reveal>
        <section className="bento p-6 sm:p-8" aria-label="Biography">
          <h2 className="text-base font-black tracking-tight sm:text-lg">Background</h2>
          <div className="mt-3">
            <Prose content={settings?.biography || settings?.intro || "Biography is being updated."} />
          </div>
        </section>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2">
        <Reveal>
          <section className="bento h-full p-6" aria-label="Education">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#D8E9FE]">
              <GraduationCap className="h-5 w-5 text-[#1e3a5f]" aria-hidden />
            </span>
            <h2 className="mt-3 text-base font-black tracking-tight">Education</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-gray-600">{settings?.educationSummary || "Education details are being updated."}</p>
          </section>
        </Reveal>

        <Reveal delay={0.06}>
          <section className="bento h-full p-6" aria-label="Professional interests">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#FDE6D2]">
              <Target className="h-5 w-5 text-[#5c3a1e]" aria-hidden />
            </span>
            <h2 className="mt-3 text-base font-black tracking-tight">Career directions</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {interests.length > 0 ? (
                interests.map((i) => <Chip key={i} tone="bone">{i}</Chip>)
              ) : (
                <p className="text-[13px] text-gray-600">Interests are being updated.</p>
              )}
            </div>
          </section>
        </Reveal>
      </div>

      <Reveal>
        <section className="bento p-6 sm:p-8" aria-label="How I work">
          <h2 className="text-base font-black tracking-tight sm:text-lg">How I approach analytical work</h2>
          <div className="mt-3 synkra-prose text-[13px] sm:text-sm">
            <p>
              Every project on this site follows the same discipline: start from a clearly stated question, document the data and where it comes from, explain the method and its assumptions, and report findings with their limitations — including what I would do differently next time.
            </p>
            <p>
              I would rather publish a smaller analysis that is honest about what it cannot say than a large one that hides its weaknesses. Where data is synthetic or simulated, it is labelled as such. Where a result is exploratory, it is called exploratory.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="bento p-6 sm:p-8" aria-label="Frequently asked questions">
          <h2 className="text-base font-black tracking-tight sm:text-lg">Frequently asked questions</h2>
          <dl className="mt-4 divide-y divide-black/5">
            {FAQ_QUESTIONS.map((item) => (
              <div key={item.question} className="py-4 first:pt-0 last:pb-0">
                <dt className="text-sm font-bold text-[#15161A]">{item.question}</dt>
                <dd className="mt-1.5 text-[13px] leading-relaxed text-gray-600">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </Reveal>

      <Reveal>
        <section className="bento p-6 sm:p-8" aria-label="Contact">
          <h2 className="text-base font-black tracking-tight sm:text-lg">Get in touch</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-600">
            The best way to reach me is LinkedIn — for recruiting questions, collaboration or feedback on my work.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {linkedinUrl ? (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#15161A] px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                <Linkedin className="h-4 w-4" aria-hidden /> Connect on LinkedIn
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-5 py-2.5 text-sm font-semibold text-gray-400 shadow-sm">
                <Linkedin className="h-4 w-4" aria-hidden /> LinkedIn profile coming soon
              </span>
            )}
            {settings?.publicEmail && (
              <a
                href={`mailto:${settings.publicEmail}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#D6F824] px-5 py-2.5 text-sm font-bold text-[#141C00] transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                <Mail className="h-4 w-4" aria-hidden /> Email me
              </a>
            )}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
