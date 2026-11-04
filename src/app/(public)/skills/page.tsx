import type { Metadata } from "next";
import { db } from "@/lib/db";
import { SKILL_STATUS_CLASSES, SKILL_STATUSES } from "@/lib/content";
import { buildBreadcrumbSchema, buildItemListSchema, JsonLdScript } from "@/lib/seo";
import { EmptyState, Chip } from "@/components/synkra/bento";
import { Reveal } from "@/components/synkra/Reveal";
import { ArrowUpRight, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Skills & Tools",
  description:
    "Skills and tools of Refilwe Molapisi — data analysis, BI, programming, statistics, commercial analysis and research, with honest self-assessed proficiency labels and evidence links.",
  alternates: { canonical: "/skills" },
  openGraph: {
    title: "Skills & Tools · Refilwe Molapisi",
    description:
      "Data analysis, BI, programming, statistics, commercial analysis and research skills, with honest self-assessed proficiency labels.",
    url: "/skills",
  },
};

export const revalidate = 60;

export default async function SkillsPage() {
  let skills: Awaited<ReturnType<typeof db.skill.findMany>> = [];
  try {
    skills = await db.skill.findMany({
      where: { isVisible: true },
      orderBy: [{ displayOrder: "asc" }],
    });
  } catch {
    // Database not ready — render empty state.
  }

  const groups = new Map<string, typeof skills>();
  for (const s of skills) {
    const list = groups.get(s.groupName) ?? [];
    list.push(s);
    groups.set(s.groupName, list);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@graph": [
            buildBreadcrumbSchema([
              { name: "Home", url: "/" },
              { name: "Skills & Tools", url: "/skills" },
            ]),
            buildItemListSchema(
              "Skills and tools of Refilwe Molapisi",
              "/skills",
              skills.map((s) => ({ name: s.name, url: "/skills" }))
            ),
          ],
        }}
      />

      <Reveal>
        <header>
          <h1 className="text-2xl font-black tracking-tight text-[#15161A] sm:text-3xl">Skills & tools</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
            An honest map of what I can do today and what I am actively learning. Skills are grouped, labelled with a self-assessed status, and linked to evidence wherever possible.
          </p>
        </header>
      </Reveal>

      {/* Status legend — labels are self-assessed, no implied certification */}
      <Reveal>
        <div className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
          <div className="text-xs leading-relaxed text-gray-500 sm:text-[13px]">
            <span className="font-bold text-[#15161A]">How to read the labels: </span>
            proficiency is <span className="font-semibold">self-assessed</span> and does not imply formal certification. Statuses move from{" "}
            {SKILL_STATUSES.map((s, i) => (
              <span key={s}>
                <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${SKILL_STATUS_CLASSES[s]}`}>{s}</span>
                {i < SKILL_STATUSES.length - 1 ? " → " : ". "}
              </span>
            ))}
            &ldquo;Project experience&rdquo; means the skill was used in a project published on this site.
          </div>
        </div>
      </Reveal>

      {skills.length === 0 ? (
        <EmptyState
          title="Skills being updated"
          message="The skills section is being curated. Check back soon."
        />
      ) : (
        <div className="space-y-8">
          {[...groups.entries()].map(([group, list], gIdx) => (
            <section key={group} aria-label={group}>
              <Reveal>
                <h2 className="mb-4 text-lg font-black tracking-tight text-[#15161A] sm:text-xl">{group}</h2>
              </Reveal>
              <div className="grid gap-4 sm:grid-cols-2">
                {list.map((s, idx) => (
                  <Reveal key={s.id} delay={0.04 * (idx % 3)}>
                    <div className="bento bento-hover h-full p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-bold text-[#15161A] sm:text-base">{s.name}</h3>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${SKILL_STATUS_CLASSES[s.statusLabel] ?? "bg-gray-200 text-gray-600"}`}>
                          {s.statusLabel}
                        </span>
                      </div>
                      {s.description && <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-[13px]">{s.description}</p>}
                      {s.evidenceUrl && (
                        <a
                          href={s.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#15161A] underline underline-offset-4"
                        >
                          View evidence <ArrowUpRight className="h-3 w-3" aria-hidden />
                        </a>
                      )}
                    </div>
                  </Reveal>
                ))}
              </div>
              {gIdx === groups.size - 1 && (
                <Reveal>
                  <p className="mt-6 text-center text-[11px] text-gray-400">
                    Currently building depth in <Chip tone="peach">Power BI</Chip> <Chip tone="peach">SQL</Chip> <Chip tone="peach">Python</Chip> through published project work.
                  </p>
                </Reveal>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
