import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import type { ReadableStream as NodeReadableStream } from "stream/web";
import { Readable } from "stream";

const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Basic id sanity
  if (!/^[a-z0-9]+$/i.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset || !asset.isPublic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Media is stored on disk (UPLOAD_DIR, default ./uploads) and served
  // through this route with immutable cache headers. On ephemeral hosts
  // (e.g. serverless) point UPLOAD_DIR at a persistent volume, or note that
  // re-uploads are needed after redeployments.
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
  const filePath = path.join(uploadDir, path.basename(asset.storagePath)); // no path traversal

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("not a file");

    const stream = Readable.toWeb(createReadStream(filePath)) as NodeReadableStream;
    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": asset.mimeType,
        "Content-Length": String(info.size),
        "Cache-Control": IMMUTABLE_CACHE,
        "Content-Disposition": `inline; filename="${encodeURIComponent(asset.originalFilename)}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
