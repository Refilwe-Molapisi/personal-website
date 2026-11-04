import { db } from "@/lib/db";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { Reveal } from "@/components/synkra/Reveal";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const [categories, projects] = await Promise.all([
    db.category.findMany({ where: { contentType: { in: ["project", "both"] } }, orderBy: { displayOrder: "asc" } }),
    db.project.findMany({ select: { id: true, title: true, status: true }, orderBy: { title: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <Reveal>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">New project</h1>
        <p className="mt-1 text-sm text-gray-500">New projects are saved as drafts — publish when you are happy with them.</p>
      </Reveal>
      <ProjectEditor
        initial={{
          title: "",
          summary: "",
          projectType: "Self-directed",
          tools: [],
          tagNames: [],
          datasetSourceUrls: [],
          references: [],
          supportingFiles: [],
          relatedProjectIds: [],
          isFeatured: false,
          displayOrder: 0,
          status: "draft",
        }}
        categories={categories}
        projectOptions={projects}
      />
    </div>
  );
}
