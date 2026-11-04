import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let projectRoutes: MetadataRoute.Sitemap = [];
  let articleRoutes: MetadataRoute.Sitemap = [];

  try {
    const [projects, articles] = await Promise.all([
      db.project.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
      db.researchArticle.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
    ]);
    projectRoutes = projects.map((p) => ({
      url: `${base}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
    articleRoutes = articles.map((a) => ({
      url: `${base}/research/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // Database not ready — ship static routes only.
  }

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/research`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/skills`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    ...projectRoutes,
    ...articleRoutes,
  ];
}
