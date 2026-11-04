import { db } from "@/lib/db";

/**
 * Fetch the singleton site settings row. Returns null when the table has not
 * been seeded yet so pages can fall back to safe defaults.
 */
export async function getSiteSettings() {
  try {
    return await db.siteSettings.findUnique({ where: { id: "singleton" } });
  } catch {
    return null;
  }
}
