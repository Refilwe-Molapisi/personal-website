/** Shared input/result types for admin server actions (types can't live in "use server" files). */
import type { Reference } from "@/lib/content";

export type ActionResult = { ok: boolean; error?: string; id?: string; slug?: string };

export type ProjectInput = {
  title: string;
  slug?: string;
  summary: string;
  categoryId?: string | null;
  projectType: string;
  statusLabel?: string;
  projectDate?: string;
  tools?: string[];
  dataNotice?: string;
  researchQuestion?: string;
  context?: string;
  datasetDescription?: string;
  datasetSourceUrls?: Reference[];
  dataPeriod?: string;
  geographicCoverage?: string;
  licenceNotes?: string;
  dataCleaningNotes?: string;
  methodology?: string;
  body?: string;
  findings?: string;
  recommendations?: string;
  limitations?: string;
  lessons?: string;
  repositoryUrl?: string;
  dashboardUrl?: string;
  supportingFiles?: string[];
  references?: Reference[];
  relatedProjectIds?: string[];
  tagNames?: string[];
  coverImageId?: string | null;
  isFeatured?: boolean;
  displayOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
};

export type ArticleInput = {
  title: string;
  slug?: string;
  summary: string;
  body: string;
  categoryId?: string | null;
  contentType: string;
  researchQuestion?: string;
  methodology?: string;
  findings?: string;
  limitations?: string;
  references?: Reference[];
  tagNames?: string[];
  coverImageId?: string | null;
  pdfAssetId?: string | null;
  isFeatured?: boolean;
  displayOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
};

export type SkillInput = {
  name: string;
  groupName: string;
  statusLabel: string;
  description?: string;
  evidenceUrl?: string;
  displayOrder?: number;
  isVisible?: boolean;
};

export type CategoryInput = {
  name: string;
  contentType: string;
  description?: string;
  displayOrder?: number;
};

export type ProfileInput = {
  displayName: string;
  headline: string;
  intro: string;
  biography: string;
  educationSummary: string;
  professionalInterests: string;
  linkedinUrl: string;
  publicEmail?: string;
  homeIntro: string;
  footerText: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
};

export const PROJECT_TYPES = ["Academic", "Self-directed", "Simulated case study", "Internship / work"] as const;
export const ARTICLE_TYPES = ["Research brief", "Market commentary", "Policy analysis", "Literature review", "Data note"] as const;
