import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["application/pdf", "pdf"],
]);

/** Validate actual file signature (magic bytes), not just the declared MIME. */
function detectSignature(buf: Buffer): string | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf.length > 12 && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return "image/webp";
  if (buf.length > 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return "application/pdf";
  return null;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const altText = String(form.get("altText") ?? "").trim();
    const caption = String(form.get("caption") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }
    if (!altText) {
      return NextResponse.json({ error: "Alt text is required for images." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File is too large (max 8 MB)." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectSignature(buffer);
    if (!detected || !ALLOWED.has(detected)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP images and PDF documents are allowed." },
        { status: 400 }
      );
    }

    const ext = ALLOWED.get(detected);
    const storagePath = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;

    // Persist to disk (UPLOAD_DIR, default ./uploads). On ephemeral hosts
    // point UPLOAD_DIR at a persistent volume — see README deployment notes.
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, storagePath), buffer);

    // Image dimensions via sharp (best-effort; PDFs have none)
    let width: number | null = null;
    let height: number | null = null;
    if (detected.startsWith("image/")) {
      try {
        const sharp = (await import("sharp")).default;
        const meta = await sharp(buffer).metadata();
        width = meta.width ?? null;
        height = meta.height ?? null;
      } catch {
        // leave dimensions null if sharp cannot read the image
      }
    }

    const asset = await db.mediaAsset.create({
      data: {
        storagePath,
        originalFilename: file.name.slice(0, 200),
        mimeType: detected,
        fileSizeBytes: file.size,
        altText,
        caption: caption || null,
        isPublic: true,
        width,
        height,
      },
    });

    return NextResponse.json({
      ok: true,
      asset: {
        id: asset.id,
        url: `/api/media/${asset.id}`,
        originalFilename: asset.originalFilename,
        mimeType: asset.mimeType,
        altText: asset.altText,
      },
    });
  } catch (e) {
    console.error("Upload failed:", e);
    return NextResponse.json({ error: "The upload failed. Please try again." }, { status: 500 });
  }
}
