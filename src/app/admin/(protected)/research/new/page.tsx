import { db } from "@/lib/db";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { Reveal } from "@/components/synkra/Reveal";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const categories = await db.category.findMany({
    where: { contentType: { in: ["research", "both"] } },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="space-y-5">
      <Reveal>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">New research article</h1>
        <p className="mt-1 text-sm text-gray-500">Articles are saved as drafts — publish when ready.</p>
      </Reveal>
      <ArticleEditor
        initial={{
          title: "",
          summary: "",
          body: "",
          contentType: "Research brief",
          tagNames: [],
          references: [],
          isFeatured: false,
          displayOrder: 0,
          status: "draft",
        }}
        categories={categories}
      />
    </div>
  );
}
