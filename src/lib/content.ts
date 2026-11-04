/** Shared helpers: slugs, JSON fields, formatting, reading time. */

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function parseJsonArray<T>(value: string | null | undefined, fallback: T[] = []): T[] {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export function parseStringList(value: string | null | undefined): string[] {
  return parseJsonArray<string>(value);
}

export type Reference = { text: string; url?: string };
export type SupportingFile = { id: string; label?: string };

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
}

export function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });
}

export function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export const SKILL_STATUSES = ["Learning", "Practising", "Project experience", "Confident"] as const;

export const SKILL_STATUS_CLASSES: Record<string, string> = {
  Learning: "bg-[#D8E9FE] text-[#1e3a5f]",
  Practising: "bg-[#FDE6D2] text-[#5c3a1e]",
  "Project experience": "bg-[#D6F824] text-[#141C00]",
  Confident: "bg-[#15161A] text-white",
};

export const CONTENT_STATUSES = ["draft", "published", "archived"] as const;

export const STATUS_CLASSES: Record<string, string> = {
  draft: "bg-[#D8E9FE] text-[#1e3a5f]",
  published: "bg-[#D6F824] text-[#141C00]",
  archived: "bg-gray-200 text-gray-600",
};

export function isValidExternalUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
