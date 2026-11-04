-- ═══════════════════════════════════════════════════════════════════════════
-- 0003_storage.sql — media bucket for covers, dashboards exports and PDFs
-- (spec §6 "Storage policies" and §7 "File uploads")
--
-- Creates the public `media` bucket used by the admin upload API
-- (src/app/api/admin/upload). The bucket is PUBLIC because it only ever
-- holds intentionally published portfolio assets; uploads are validated
-- server-side (MIME allowlist + magic-byte signature, 8 MB cap) and are
-- only performed with the service-role key from the server.
-- ═══════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  8388608, -- 8 MB, mirrors MAX_BYTES in the upload API route
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
  set public            = true,
      file_size_limit   = 8388608,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- ── Storage access policies ────────────────────────────────────────────────
-- Public read of the media bucket (anon + authenticated).

drop policy if exists "Public read media bucket" on storage.objects;
create policy "Public read media bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

-- Writes are intentionally NOT granted to anon/authenticated. Uploads happen
-- server-side with the service-role key (which bypasses RLS) after admin
-- authentication and file validation in src/app/api/admin/upload/route.ts.
