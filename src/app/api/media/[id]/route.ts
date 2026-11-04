import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { supabaseConfigured, getPublicMediaUrl, getSignedMediaUrl } from "@/lib/supabase/storage";
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
  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // ── Supabase Storage-backed assets (production path) ──────────────────────
  if (supabaseConfigured() && asset.storageBucket) {
    if (asset.isPublic) {
      const publicUrl = getPublicMediaUrl(asset.storagePath);
      if (publicUrl) {
        // 307 preserves the method; browsers/CDNs may cache the redirect.
        return new NextResponse(null, {
          status: 307,
          headers: { Location: publicUrl, "Cache-Control": IMMUTABLE_CACHE },
        });
      }
    } else {
      // Private asset: short-lived signed URLs, admins only.
      if (await isAdmin()) {
        const signed = await getSignedMediaUrl(asset.storagePath);
        if (signed) return NextResponse.redirect(signed, 307);
      }
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  // ── Local disk fallback (development without Supabase Storage) ───────────
  if (!asset.isPublic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
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
