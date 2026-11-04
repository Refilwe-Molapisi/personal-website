import { db } from "@/lib/db";
import { MediaLibrary, type MediaRow } from "@/components/admin/MediaLibrary";
import { Reveal } from "@/components/synkra/Reveal";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const assets = await db.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  const rows: MediaRow[] = assets.map((a) => ({
    id: a.id,
    url: `/api/media/${a.id}`,
    originalFilename: a.originalFilename,
    mimeType: a.mimeType,
    fileSizeBytes: a.fileSizeBytes,
    altText: a.altText,
    caption: a.caption,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-5">
      <Reveal>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Media library</h1>
        <p className="mt-1 text-sm text-gray-500">
          JPEG, PNG, WebP and PDF files up to 8 MB. Upload from any project or article editor; files referenced by content are protected from deletion.
        </p>
      </Reveal>
      <MediaLibrary assets={rows} />
    </div>
  );
}
