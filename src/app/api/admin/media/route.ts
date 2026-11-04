import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const assets = await db.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true, originalFilename: true, mimeType: true, fileSizeBytes: true,
      altText: true, caption: true, createdAt: true,
    },
  });
  return NextResponse.json({
    assets: assets.map((a) => ({ ...a, url: `/api/media/${a.id}` })),
  });
}
