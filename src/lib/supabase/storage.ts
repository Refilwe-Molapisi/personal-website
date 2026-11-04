import "server-only";

/**
 * Minimal Supabase Storage client built on fetch — no extra dependency.
 *
 * Used by the admin upload API to persist media (covers, PDFs) in a public
 * Supabase Storage bucket, which is the Vercel-safe replacement for writing
 * to the (ephemeral) server filesystem. Falls back to local disk storage in
 * development when the Supabase env vars are not configured.
 */

const BUCKET = process.env.SUPABASE_MEDIA_BUCKET || "media";

export function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function serviceHeaders(extra: Record<string, string> = {}): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY as string}`,
    ...extra,
  };
}

/** Public (CDN-cacheable) URL of an object in the public media bucket. */
export function getPublicMediaUrl(path: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${path}`;
}

/** Upload bytes to the media bucket. Throws with the storage error message. */
export async function uploadMedia(buffer: Buffer, path: string, mimeType: string): Promise<void> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error("Supabase Storage is not configured");

  const res = await fetch(`${base.replace(/\/$/, "")}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: serviceHeaders({ "Content-Type": mimeType, "x-upsert": "false" }),
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase upload failed (${res.status}): ${detail.slice(0, 200)}`);
  }
}

/** Short-lived signed URL for non-public assets (e.g. admin previews). */
export async function getSignedMediaUrl(path: string, expiresIn = 300): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return null;

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/storage/v1/object/sign/${BUCKET}/${path}`, {
      method: "POST",
      headers: serviceHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ expiresIn }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { signedURL?: string };
    return data.signedURL ? `${base.replace(/\/$/, "")}/storage/v1${data.signedURL}` : null;
  } catch {
    return null;
  }
}
