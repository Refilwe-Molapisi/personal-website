import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { parseJsonArray, parseStringList } from "@/lib/content";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditProjectPage({ params }: { params: Params }) {
  const { id } = await params;
  if (!/^[a-z0-9]+$/i.test(id)) notFound();

  const [project, categories, projects] = await Promise.all([
    db.project.findUnique({ where: { id }, include: { tags: true } }),
    db.category.findMany({ where: { contentType: { in: ["project", "both"] } }, orderBy: { displayOrder: "asc" } }),
    db.project.findMany({ select: { id: true, title: true, status: true }, orderBy: { title: "asc" } }),
  ]);
  if (!project) notFound();

  return (
    <ProjectEditor
      initial={{
        id: project.id,
        status: project.status,
        title: project.title,
        slug: project.slug,
        summary: project.summary,
        categoryId: project.categoryId,
        projectType: project.projectType,
        statusLabel: project.statusLabel ?? "",
        projectDate: project.projectDate ?? "",
        tools: parseStringList(project.tools),
        dataNotice: project.dataNotice ?? "",
        researchQuestion: project.researchQuestion,
        context: project.context,
        datasetDescription: project.datasetDescription,
        datasetSourceUrls: parseJsonArray(project.datasetSourceUrls),
        dataPeriod: project.dataPeriod ?? "",
        geographicCoverage: project.geographicCoverage ?? "",
        licenceNotes: project.licenceNotes ?? "",
        dataCleaningNotes: project.dataCleaningNotes ?? "",
        methodology: project.methodology,
        body: project.body,
        findings: project.findings,
        recommendations: project.recommendations,
        limitations: project.limitations,
        lessons: project.lessons,
        repositoryUrl: project.repositoryUrl ?? "",
        dashboardUrl: project.dashboardUrl ?? "",
        supportingFiles: parseJsonArray<string>(project.supportingFiles),
        references: parseJsonArray(project.references),
        relatedProjectIds: parseJsonArray<string>(project.relatedProjectIds),
        tagNames: project.tags.map((t) => t.name),
        coverImageId: project.coverImageId,
        isFeatured: project.isFeatured,
        displayOrder: project.displayOrder,
        metaTitle: project.metaTitle ?? "",
        metaDescription: project.metaDescription ?? "",
      }}
      categories={categories}
      projectOptions={projects}
    />
  );
}
