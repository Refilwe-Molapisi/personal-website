import { db } from "@/lib/db";
import { CategoryManager, type CategoryRow } from "@/components/admin/CategoryManager";
import { Reveal } from "@/components/synkra/Reveal";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, projects, articles] = await Promise.all([
    db.category.findMany({ orderBy: [{ displayOrder: "asc" }, { name: "asc" }] }),
    db.project.groupBy({ by: ["categoryId"], _count: true }),
    db.researchArticle.groupBy({ by: ["categoryId"], _count: true }),
  ]);

  const usage = new Map<string, number>();
  for (const p of projects) if (p.categoryId) usage.set(p.categoryId, (usage.get(p.categoryId) ?? 0) + p._count);
  for (const a of articles) if (a.categoryId) usage.set(a.categoryId, (usage.get(a.categoryId) ?? 0) + a._count);

  const rows: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    contentType: c.contentType,
    description: c.description,
    displayOrder: c.displayOrder,
    usageCount: usage.get(c.id) ?? 0,
  }));

  return (
    <div className="space-y-5">
      <Reveal>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Categories</h1>
        <p className="mt-1 text-sm text-gray-500">Shared across projects and research topics, per the “Applies to” setting.</p>
      </Reveal>
      <CategoryManager categories={rows} />
    </div>
  );
}
