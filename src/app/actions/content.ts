"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { estimateReadingTime, isValidExternalUrl, slugify, type Reference } from "@/lib/content";
import type { ActionResult, ArticleInput, ProjectInput } from "@/lib/adminTypes";

async function audit(actor: string, action: string, contentType: string, contentId?: string) {
  await db.auditLog
    .create({ data: { actorEmail: actor, action, contentType, contentId, metadata: "{}" } })
    .catch(() => {});
}

async function uniqueSlug(base: string, table: "project" | "article", excludeId?: string): Promise<string> {
  const root = slugify(base) || `untitled-${Date.now()}`;
  let candidate = root;
  for (let i = 0; i < 50; i++) {
    const existing =
      table === "project"
        ? await db.project.findUnique({ where: { slug: candidate } })
        : await db.researchArticle.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${i + 2}`;
  }
  return `${root}-${Date.now()}`;
}

function tagsConnectOrCreate(names: string[]) {
  const clean = names.map((n) => n.trim()).filter(Boolean).slice(0, 12);
  return {
    connectOrCreate: clean.map((name) => ({
      where: { slug: slugify(name) },
      create: { name, slug: slugify(name) },
    })),
  };
}

/* ════════════════ PROJECTS ════════════════ */

function validateProjectInput(input: ProjectInput): string | null {
  if (!input.title?.trim()) return "A title is required.";
  if (input.title.length > 200) return "The title is too long (max 200 characters).";
  if (!input.summary?.trim()) return "A short summary is required.";
  if (input.summary.length > 600) return "The summary is too long (max 600 characters).";
  if (input.repositoryUrl && !isValidExternalUrl(input.repositoryUrl)) return "The repository link must be a valid http(s) URL.";
  if (input.dashboardUrl && !isValidExternalUrl(input.dashboardUrl)) return "The dashboard link must be a valid http(s) URL.";
  for (const ref of [...(input.references ?? []), ...(input.datasetSourceUrls ?? [])]) {
    if (ref.url && !isValidExternalUrl(ref.url)) return `The link "${ref.url}" is not a valid http(s) URL.`;
  }
  return null;
}

export async function saveProjectAction(
  input: ProjectInput,
  id?: string
): Promise<ActionResult> {
  const actor = await requireAdmin();
  const validationError = validateProjectInput(input);
  if (validationError) return { ok: false, error: validationError };

  const slug = await uniqueSlug(input.slug?.trim() || input.title, "project", id);
  const data = {
    title: input.title.trim(),
    slug,
    summary: input.summary.trim(),
    categoryId: input.categoryId || null,
    projectType: input.projectType || "Self-directed",
    statusLabel: input.statusLabel?.trim() || null,
    projectDate: input.projectDate?.trim() || null,
    tools: JSON.stringify((input.tools ?? []).map((t) => t.trim()).filter(Boolean).slice(0, 15)),
    dataNotice: input.dataNotice?.trim() || null,
    researchQuestion: input.researchQuestion ?? "",
    context: input.context ?? "",
    datasetDescription: input.datasetDescription ?? "",
    datasetSourceUrls: JSON.stringify((input.datasetSourceUrls ?? []).filter((r) => r.text?.trim() || r.url?.trim())),
    dataPeriod: input.dataPeriod?.trim() || null,
    geographicCoverage: input.geographicCoverage?.trim() || null,
    licenceNotes: input.licenceNotes?.trim() || null,
    dataCleaningNotes: input.dataCleaningNotes ?? "",
    methodology: input.methodology ?? "",
    body: input.body ?? "",
    findings: input.findings ?? "",
    recommendations: input.recommendations ?? "",
    limitations: input.limitations ?? "",
    lessons: input.lessons ?? "",
    repositoryUrl: input.repositoryUrl?.trim() || null,
    dashboardUrl: input.dashboardUrl?.trim() || null,
    supportingFiles: JSON.stringify((input.supportingFiles ?? []).filter(Boolean).slice(0, 10)),
    references: JSON.stringify((input.references ?? []).filter((r) => r.text?.trim() || r.url?.trim())),
    relatedProjectIds: JSON.stringify((input.relatedProjectIds ?? []).filter((x) => x && x !== id).slice(0, 6)),
    coverImageId: input.coverImageId || null,
    isFeatured: Boolean(input.isFeatured),
    displayOrder: Number.isFinite(input.displayOrder) ? Number(input.displayOrder) : 0,
    metaTitle: input.metaTitle?.trim() || null,
    metaDescription: input.metaDescription?.trim() || null,
  };

  if (id) {
    const previous = await db.project.findUnique({ where: { id } });
    if (!previous) return { ok: false, error: "Project not found." };
    const revisionCount = await db.contentRevision.count({ where: { contentType: "project", contentId: id } });
    await db.contentRevision.create({
      data: {
        contentType: "project",
        contentId: id,
        revisionNumber: revisionCount + 1,
        snapshot: JSON.stringify({ title: previous.title, summary: previous.summary, body: previous.body, findings: previous.findings, updatedAt: previous.updatedAt }),
      },
    });
    await db.project.update({ where: { id }, data: { ...data, tags: tagsConnectOrCreate(input.tagNames ?? []) } });
    await audit(actor, "update", "project", id);
  } else {
    const created = await db.project.create({
      data: { ...data, status: "draft", tags: tagsConnectOrCreate(input.tagNames ?? []) },
    });
    id = created.id;
    await audit(actor, "create", "project", id);
  }

  revalidatePath("/", "layout");
  return { ok: true, id, slug };
}

export async function setProjectStatusAction(id: string, status: "draft" | "published" | "archived"): Promise<ActionResult> {
  const actor = await requireAdmin();

  if (status === "published") {
    const p = await db.project.findUnique({ where: { id } });
    if (!p) return { ok: false, error: "Project not found." };
    if (!p.title?.trim() || !p.summary?.trim()) {
      return { ok: false, error: "Cannot publish: a title and short summary are required." };
    }
  }

  await db.project.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "published" ? new Date() : undefined,
      archivedAt: status === "archived" ? new Date() : null,
    },
  });
  await audit(actor, status, "project", id);
  revalidatePath("/", "layout");
  return { ok: true, id };
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  const actor = await requireAdmin();
  const p = await db.project.findUnique({ where: { id } });
  if (!p) return { ok: false, error: "Project not found." };
  await db.project.delete({ where: { id } });
  await audit(actor, "delete", "project", id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function duplicateProjectAction(id: string): Promise<ActionResult> {
  const actor = await requireAdmin();
  const source = await db.project.findUnique({ where: { id } });
  if (!source) return { ok: false, error: "Project not found." };
  const slug = await uniqueSlug(`${source.title} copy`, "project");
  const copy = await db.project.create({
    data: {
      title: `${source.title} (copy)`,
      slug,
      summary: source.summary,
      coverImageId: source.coverImageId,
      categoryId: source.categoryId,
      projectType: source.projectType,
      statusLabel: source.statusLabel,
      projectDate: source.projectDate,
      tools: source.tools,
      dataNotice: source.dataNotice,
      researchQuestion: source.researchQuestion,
      context: source.context,
      datasetDescription: source.datasetDescription,
      datasetSourceUrls: source.datasetSourceUrls,
      dataPeriod: source.dataPeriod,
      geographicCoverage: source.geographicCoverage,
      licenceNotes: source.licenceNotes,
      dataCleaningNotes: source.dataCleaningNotes,
      methodology: source.methodology,
      body: source.body,
      findings: source.findings,
      recommendations: source.recommendations,
      limitations: source.limitations,
      lessons: source.lessons,
      repositoryUrl: source.repositoryUrl,
      dashboardUrl: source.dashboardUrl,
      supportingFiles: source.supportingFiles,
      references: source.references,
      status: "draft",
      metaTitle: source.metaTitle,
      metaDescription: source.metaDescription,
    },
  });
  await audit(actor, "duplicate", "project", copy.id);
  revalidatePath("/admin/projects");
  return { ok: true, id: copy.id };
}

/* ════════════════ RESEARCH ARTICLES ════════════════ */

export async function saveArticleAction(input: ArticleInput, id?: string): Promise<ActionResult> {
  const actor = await requireAdmin();
  if (!input.title?.trim()) return { ok: false, error: "A title is required." };
  if (input.title.length > 200) return { ok: false, error: "The title is too long (max 200 characters)." };
  if (!input.summary?.trim()) return { ok: false, error: "A summary/abstract is required." };
  if (input.summary.length > 600) return { ok: false, error: "The summary is too long (max 600 characters)." };
  if (!input.body?.trim()) return { ok: false, error: "The article body cannot be empty." };
  for (const ref of input.references ?? []) {
    if (ref.url && !isValidExternalUrl(ref.url)) return { ok: false, error: `The link "${ref.url}" is not a valid http(s) URL.` };
  }

  const slug = await uniqueSlug(input.slug?.trim() || input.title, "article", id);
  const data = {
    title: input.title.trim(),
    slug,
    summary: input.summary.trim(),
    body: input.body,
    categoryId: input.categoryId || null,
    contentType: input.contentType || "Research brief",
    researchQuestion: input.researchQuestion?.trim() || null,
    methodology: input.methodology?.trim() || null,
    findings: input.findings?.trim() || null,
    limitations: input.limitations?.trim() || null,
    references: JSON.stringify((input.references ?? []).filter((r) => r.text?.trim() || r.url?.trim())),
    coverImageId: input.coverImageId || null,
    pdfAssetId: input.pdfAssetId || null,
    readingTimeMinutes: estimateReadingTime(input.body),
    isFeatured: Boolean(input.isFeatured),
    displayOrder: Number.isFinite(input.displayOrder) ? Number(input.displayOrder) : 0,
    metaTitle: input.metaTitle?.trim() || null,
    metaDescription: input.metaDescription?.trim() || null,
  };

  if (id) {
    const previous = await db.researchArticle.findUnique({ where: { id } });
    if (!previous) return { ok: false, error: "Article not found." };
    const revisionCount = await db.contentRevision.count({ where: { contentType: "research_article", contentId: id } });
    await db.contentRevision.create({
      data: {
        contentType: "research_article",
        contentId: id,
        revisionNumber: revisionCount + 1,
        snapshot: JSON.stringify({ title: previous.title, summary: previous.summary, body: previous.body, updatedAt: previous.updatedAt }),
      },
    });
    await db.researchArticle.update({ where: { id }, data: { ...data, tags: tagsConnectOrCreate(input.tagNames ?? []) } });
    await audit(actor, "update", "research_article", id);
  } else {
    const created = await db.researchArticle.create({
      data: { ...data, status: "draft", tags: tagsConnectOrCreate(input.tagNames ?? []) },
    });
    id = created.id;
    await audit(actor, "create", "research_article", id);
  }

  revalidatePath("/", "layout");
  return { ok: true, id, slug };
}

export async function setArticleStatusAction(id: string, status: "draft" | "published" | "archived"): Promise<ActionResult> {
  const actor = await requireAdmin();
  if (status === "published") {
    const a = await db.researchArticle.findUnique({ where: { id } });
    if (!a) return { ok: false, error: "Article not found." };
    if (!a.title?.trim() || !a.summary?.trim() || !a.body?.trim()) {
      return { ok: false, error: "Cannot publish: title, summary and body are required." };
    }
  }
  await db.researchArticle.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "published" ? new Date() : undefined,
      archivedAt: status === "archived" ? new Date() : null,
    },
  });
  await audit(actor, status, "research_article", id);
  revalidatePath("/", "layout");
  return { ok: true, id };
}

export async function deleteArticleAction(id: string): Promise<ActionResult> {
  const actor = await requireAdmin();
  const a = await db.researchArticle.findUnique({ where: { id } });
  if (!a) return { ok: false, error: "Article not found." };
  await db.researchArticle.delete({ where: { id } });
  await audit(actor, "delete", "research_article", id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function duplicateArticleAction(id: string): Promise<ActionResult> {
  const actor = await requireAdmin();
  const source = await db.researchArticle.findUnique({ where: { id } });
  if (!source) return { ok: false, error: "Article not found." };
  const slug = await uniqueSlug(`${source.title} copy`, "article");
  const copy = await db.researchArticle.create({
    data: {
      title: `${source.title} (copy)`,
      slug,
      summary: source.summary,
      body: source.body,
      categoryId: source.categoryId,
      contentType: source.contentType,
      references: source.references,
      coverImageId: source.coverImageId,
      readingTimeMinutes: source.readingTimeMinutes,
      status: "draft",
      metaTitle: source.metaTitle,
      metaDescription: source.metaDescription,
    },
  });
  await audit(actor, "duplicate", "research_article", copy.id);
  revalidatePath("/admin/research");
  return { ok: true, id: copy.id };
}

/* ════════════════ SKILLS ════════════════ */

export async function saveSkillAction(
  input: { id?: string; name: string; groupName: string; statusLabel: string; description?: string; evidenceUrl?: string; displayOrder?: number; isVisible?: boolean }
): Promise<ActionResult> {
  const actor = await requireAdmin();
  if (!input.name?.trim()) return { ok: false, error: "Skill name is required." };
  if (input.evidenceUrl && !isValidExternalUrl(input.evidenceUrl)) return { ok: false, error: "The evidence link must be a valid http(s) URL." };
  const data = {
    name: input.name.trim(),
    groupName: input.groupName?.trim() || "Data analysis and BI",
    statusLabel: input.statusLabel || "Learning",
    description: input.description?.trim() || "",
    evidenceUrl: input.evidenceUrl?.trim() || null,
    displayOrder: Number(input.displayOrder) || 0,
    isVisible: input.isVisible ?? true,
  };
  if (input.id) {
    await db.skill.update({ where: { id: input.id }, data });
    await audit(actor, "update", "skill", input.id);
  } else {
    const existing = await db.skill.findUnique({ where: { slug: slugify(data.name) } });
    if (existing) return { ok: false, error: "A skill with a similar name already exists." };
    const created = await db.skill.create({ data: { ...data, slug: slugify(data.name) } });
    await audit(actor, "create", "skill", created.id);
  }
  revalidatePath("/skills");
  revalidatePath("/admin/skills");
  return { ok: true };
}

export async function deleteSkillAction(id: string): Promise<ActionResult> {
  const actor = await requireAdmin();
  await db.skill.delete({ where: { id } }).catch(() => {});
  await audit(actor, "delete", "skill", id);
  revalidatePath("/skills");
  revalidatePath("/admin/skills");
  return { ok: true };
}

/* ════════════════ CATEGORIES ════════════════ */

export async function saveCategoryAction(
  input: { id?: string; name: string; contentType: string; description?: string; displayOrder?: number }
): Promise<ActionResult> {
  const actor = await requireAdmin();
  if (!input.name?.trim()) return { ok: false, error: "Category name is required." };
  const data = {
    name: input.name.trim(),
    contentType: ["project", "research", "both"].includes(input.contentType) ? input.contentType : "both",
    description: input.description?.trim() || null,
    displayOrder: Number(input.displayOrder) || 0,
  };
  if (input.id) {
    const dupe = await db.category.findFirst({ where: { slug: slugify(data.name), NOT: { id: input.id } } });
    if (dupe) return { ok: false, error: "Another category with this name already exists." };
    await db.category.update({ where: { id: input.id }, data });
    await audit(actor, "update", "category", input.id);
  } else {
    const dupe = await db.category.findUnique({ where: { slug: slugify(data.name) } });
    if (dupe) return { ok: false, error: "A category with this name already exists." };
    const created = await db.category.create({ data: { ...data, slug: slugify(data.name) } });
    await audit(actor, "create", "category", created.id);
  }
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const actor = await requireAdmin();
  const [projects, articles] = await Promise.all([
    db.project.count({ where: { categoryId: id } }),
    db.researchArticle.count({ where: { categoryId: id } }),
  ]);
  if (projects > 0 || articles > 0) {
    return {
      ok: false,
      error: `This category is used by ${projects} project(s) and ${articles} article(s). Reassign them before deleting.`,
    };
  }
  await db.category.delete({ where: { id } });
  await audit(actor, "delete", "category", id);
  revalidatePath("/admin/categories");
  return { ok: true };
}

/* ════════════════ PROFILE / SETTINGS ════════════════ */

export async function saveProfileAction(input: {
  displayName: string; headline: string; intro: string; biography: string; educationSummary: string;
  professionalInterests: string; linkedinUrl: string; publicEmail?: string; homeIntro: string;
  footerText: string; defaultMetaTitle: string; defaultMetaDescription: string;
}): Promise<ActionResult> {
  const actor = await requireAdmin();
  if (!input.displayName?.trim()) return { ok: false, error: "Display name is required." };
  if (input.linkedinUrl && !isValidExternalUrl(input.linkedinUrl)) {
    return { ok: false, error: "The LinkedIn URL must be a valid http(s) URL." };
  }
  if (input.publicEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.publicEmail)) {
    return { ok: false, error: "The public email address is not valid." };
  }
  await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: { ...input, publicEmail: input.publicEmail?.trim() || null },
    create: { id: "singleton", ...input, publicEmail: input.publicEmail?.trim() || null },
  });
  await audit(actor, "update", "site_settings", "singleton");
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ════════════════ MEDIA ════════════════ */

export async function updateMediaAction(id: string, altText: string, caption: string): Promise<ActionResult> {
  await requireAdmin();
  await db.mediaAsset.update({ where: { id }, data: { altText: altText.trim(), caption: caption.trim() || null } });
  revalidatePath("/admin/media");
  return { ok: true };
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const [coverProjects, coverArticles, pdfArticles] = await Promise.all([
    db.project.count({ where: { coverImageId: id } }),
    db.researchArticle.count({ where: { coverImageId: id } }),
    db.researchArticle.count({ where: { pdfAssetId: id } }),
  ]);
  // Also scan JSON supporting-file fields
  const projectsWithSupporting = await db.project.findMany({
    where: { supportingFiles: { contains: id } },
    select: { id: true },
  });
  const inUse = coverProjects + coverArticles + pdfArticles + projectsWithSupporting.length;
  if (inUse > 0) {
    return { ok: false, error: `This file is referenced by ${inUse} content item(s). Remove it there first.` };
  }
  const asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset) return { ok: false, error: "File not found." };
  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
  await fs.unlink(path.join(uploadDir, asset.storagePath)).catch(() => {});
  await db.mediaAsset.delete({ where: { id } });
  revalidatePath("/admin/media");
  return { ok: true };
}
