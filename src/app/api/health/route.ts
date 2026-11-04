import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Health check — used by uptime monitors and as a quick diagnostic that the
 * app and its database connection are alive. Safe to expose: it reports
 * status only, never configuration or credentials.
 */
export async function GET() {
  let database = "unavailable";
  try {
    await db.$queryRaw`SELECT 1`;
    database = "up";
  } catch {
    database = "down";
  }

  return NextResponse.json(
    { status: "ok", database, timestamp: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
