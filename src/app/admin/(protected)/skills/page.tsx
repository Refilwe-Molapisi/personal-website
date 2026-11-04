import { db } from "@/lib/db";
import { SkillManager, type SkillRow } from "@/components/admin/SkillManager";
import { Reveal } from "@/components/synkra/Reveal";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const skills = await db.skill.findMany({ orderBy: [{ displayOrder: "asc" }, { name: "asc" }] });
  const rows: SkillRow[] = skills.map((s) => ({
    id: s.id,
    name: s.name,
    groupName: s.groupName,
    statusLabel: s.statusLabel,
    description: s.description,
    evidenceUrl: s.evidenceUrl,
    displayOrder: s.displayOrder,
    isVisible: s.isVisible,
  }));

  return (
    <div className="space-y-5">
      <Reveal>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Skills</h1>
        <p className="mt-1 text-sm text-gray-500">Grouped, self-assessed, and optionally linked to evidence. Hidden skills stay saved but leave the public page.</p>
      </Reveal>
      <SkillManager skills={rows} />
    </div>
  );
}
