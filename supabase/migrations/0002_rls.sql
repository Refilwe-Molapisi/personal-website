-- ═══════════════════════════════════════════════════════════════════════════
-- 0002_rls.sql — Row Level Security (spec §6)
--
-- RLS is enabled on every public-schema table. The application talks to the
-- database through Prisma using the owner connection (postgres role), which
-- bypasses RLS; these policies therefore gate the *PostgREST API surface*
-- (anon / authenticated roles, e.g. anyone with the public anon key).
--
-- Public visitors may READ published content only. No anon/authenticated
-- write policies exist — all mutations happen through the server-side admin
-- (Prisma, authenticated by the admin session in src/lib/auth.ts).
-- ContentRevision and AuditLog get no policies at all: invisible via API.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Guard: ensure the API roles exist ──────────────────────────────────────
-- On Supabase these roles always exist; the guard keeps the migration
-- runnable on any vanilla Postgres (e.g. local development).

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
end
$$;

-- ── Enable RLS everywhere ──────────────────────────────────────────────────
alter table public."SiteSettings"     enable row level security;
alter table public."Category"         enable row level security;
alter table public."Project"          enable row level security;
alter table public."ResearchArticle"  enable row level security;
alter table public."Tag"              enable row level security;
alter table public."Skill"            enable row level security;
alter table public."MediaAsset"       enable row level security;
alter table public."ContentRevision"  enable row level security;
alter table public."AuditLog"         enable row level security;
alter table public."_ProjectToTag"         enable row level security;
alter table public."_ResearchArticleToTag" enable row level security;

-- ── Public read policies (SELECT only, anon + authenticated) ───────────────

-- Site settings: the singleton row holds only public profile/display fields.
drop policy if exists "Public read site settings" on public."SiteSettings";
create policy "Public read site settings"
  on public."SiteSettings" for select
  to anon, authenticated
  using (true);

-- Categories and tags: needed for public navigation and filtering.
drop policy if exists "Public read categories" on public."Category";
create policy "Public read categories"
  on public."Category" for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read tags" on public."Tag";
create policy "Public read tags"
  on public."Tag" for select
  to anon, authenticated
  using (true);

-- Projects and research articles: published only. Drafts/archived stay hidden.
drop policy if exists "Public read published projects" on public."Project";
create policy "Public read published projects"
  on public."Project" for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Public read published articles" on public."ResearchArticle";
create policy "Public read published articles"
  on public."ResearchArticle" for select
  to anon, authenticated
  using (status = 'published');

-- Skills: only visible ones.
drop policy if exists "Public read visible skills" on public."Skill";
create policy "Public read visible skills"
  on public."Skill" for select
  to anon, authenticated
  using ("isVisible" = true);

-- Media metadata: public assets referenced by published content.
drop policy if exists "Public read media metadata" on public."MediaAsset";
create policy "Public read media metadata"
  on public."MediaAsset" for select
  to anon, authenticated
  using ("isPublic" = true);

-- Join tables: readable only as far as both sides are public (defence in
-- depth — the API never queries them directly for drafts anyway).
drop policy if exists "Public read project tags" on public."_ProjectToTag";
create policy "Public read project tags"
  on public."_ProjectToTag" for select
  to anon, authenticated
  using (
    exists (select 1 from public."Project" p where p.id = "A" and p.status = 'published')
  );

drop policy if exists "Public read article tags" on public."_ResearchArticleToTag";
create policy "Public read article tags"
  on public."_ResearchArticleToTag" for select
  to anon, authenticated
  using (
    exists (select 1 from public."ResearchArticle" a where a.id = "A" and a.status = 'published')
  );

-- ── No policies granted for writes ─────────────────────────────────────────
-- ContentRevision, AuditLog: no policies (fully locked from the API).
-- INSERT / UPDATE / DELETE: no anon or authenticated policies on any table.
-- Server-side admin writes run through Prisma over the owner connection.
