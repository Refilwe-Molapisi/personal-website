import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { parseJsonArray } from "@/lib/content";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditArticlePage({ params }: { params: Params }) {
  const { id } = await params;
  if (!/^[a-z0-9]+$/i.test(id)) notFound();

  const [article, categories] = await Promise.all([
    db.researchArticle.findUnique({ where: { id }, include: { tags: true } }),
    db.category.findMany({ where: { contentType: { in: ["research", "both"] } }, orderBy: { displayOrder: "asc" } }),
  ]);
  if (!article) notFound();

  return (
    <ArticleEditor
      initial={{
        id: article.id,
        status: article.status,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        body: article.body,
        categoryId: article.categoryId,
        contentType: article.contentType,
        researchQuestion: article.researchQuestion ?? "",
        methodology: article.methodology ?? "",
        findings: article.findings ?? "",
        limitations: article.limitations ?? "",
        references: parseJsonArray(article.references),
        tagNames: article.tags.map((t) => t.name),
        coverImageId: article.coverImageId,
        pdfAssetId: article.pdfAssetId,
        isFeatured: article.isFeatured,
        displayOrder: article.displayOrder,
        metaTitle: article.metaTitle ?? "",
        metaDescription: article.metaDescription ?? "",
      }}
      categories={categories}
    />
  );
}
