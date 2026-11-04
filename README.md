# Refilwe Molapisi — Professional Analytics Portfolio

A professional portfolio website for a final-year BCom Economics student, built as a
job-search and professional-evidence platform. Public visitors browse published
projects, research and skills; the owner manages all content through a private
admin panel — no code changes or redeployments needed for ordinary content edits.

Built with the **Synkra Design Language** (Soft Bento Minimalism, obsidian
surfaces, chartreuse accents, Outfit typeface) with soft, reduced-motion-aware
animations throughout.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4, custom Synkra token layer (`src/app/globals.css`) |
| UI primitives | shadcn/ui (New York) + Lucide icons |
| Animation | Framer Motion (scroll reveals, reduced-motion aware) + CSS keyframes |
| Database | **Supabase Postgres** via Prisma ORM (`DATABASE_URL` pooled, `DIRECT_URL` direct) |
| Media | **Supabase Storage** (`media` public bucket) with local-disk fallback in dev |
| Markdown | react-markdown + remark-gfm (raw HTML escaped — XSS-safe) |
| Auth | Server-side HMAC-signed session cookie (HttpOnly) + login rate limiting |
| Hosting | **Vercel** (`vercel.json` ships security headers) |

## SEO / AEO / GEO — how this site stays crawlable and citable

- **Metadata**: per-page titles/descriptions, canonical URLs, Open Graph + Twitter
  cards with a generated 1200×630 share image (`public/og.png`), `lang="en-ZA"`,
  web manifest and SVG/PNG icons.
- **robots.txt** (`src/app/robots.ts`): welcomes traditional search engines *and*
  explicitly allows the AI crawlers (GPTBot, OAI-SearchBot, ClaudeBot, Claude-User,
  Claude-SearchBot, PerplexityBot/‑User, Google-Extended, Applebot-Extended, CCBot,
  Amazonbot, meta-externalagent, Bytespider, DuckAssistBot, YouBot, cohere-ai…).
  `/admin` and `/api` stay blocked for every agent.
- **sitemap.xml** (`src/app/sitemap.ts`): static pages + every published
  project/article, regenerated hourly.
- **Structured data (JSON-LD)**: site-wide `Person` + `WebSite` graph (with
  `sameAs`, `knowsAbout`), `ProfilePage` on the home page, `BreadcrumbList` on all
  listing/detail pages, `CreativeWork`/`Article` entities linked by `@id` to the
  Person node, and a `FAQPage` matching the visible FAQ on the About page.
- **AEO**: a real, visible FAQ section on `/about` whose answers are mirrored in
  FAQPage schema — the format answer engines quote most reliably.
- **GEO**: dynamic [`/llms.txt`](public) and [`/llms-full.txt`](public) routes give
  LLMs a clean markdown brief of who Refilwe is, verified facts, and a live
  catalogue of every published project and article (always in sync with the
  database, URLs match the deployment origin).
- Clean semantics throughout: one `h1` per page, labelled landmarks, descriptive
  alt text, filtered/paginated listing views are `noindex, follow`.

---

## Routes

### Public
| Route | Purpose |
|---|---|
| `/` | Home — hero, focus areas, featured projects, recent research, skills preview, LinkedIn CTA |
| `/projects` | Project index — search (title/summary), category filter, sort (featured/newest/oldest/A–Z), pagination |
| `/projects/[slug]` | Project detail — question, context, data & sources, methodology, analysis (markdown), findings, recommendations, limitations, lessons, references, files, related projects |
| `/research` | Research index — search, topic filter, sort, pagination |
| `/research/[slug]` | Article — abstract, body, structured sections, references, tags, PDF download, related reading |
| `/skills` | Skills & tools — grouped, self-assessed status labels, evidence links |
| `/about` | Biography, education, career directions, approach, FAQ, contact |
| `/privacy` | POPIA-conscious privacy notice |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, `/manifest.webmanifest` | Machine-readable discovery surfaces |
| `/api/health` | JSON health check (app + database status) |
| `not-found.tsx` + `error.tsx` | Friendly 404 and error states (no stack traces leaked) |

### Admin (all under `/admin`, session-protected, `noindex`)
| Route | Purpose |
|---|---|
| `/admin/login` | Sign-in (rate limited, env credentials) |
| `/admin` | Dashboard — counts, setup warnings, quick actions, recently updated |
| `/admin/projects` · `/new` · `/[id]/edit` | Full project CRUD: draft/publish/unpublish/archive/restore/duplicate/delete, featured flag, ordering, cover image, supporting files, references, related projects, SEO fields, revision snapshots |
| `/admin/research` · `/new` · `/[id]/edit` | Same lifecycle for articles + reading time, PDF upload, tags |
| `/admin/skills` | Skill CRUD, grouping, status, visibility toggle, evidence links |
| `/admin/categories` | Category CRUD with in-use protection |
| `/admin/media` | Media library — filter, alt/caption editing, copy URL, reference-safe delete |
| `/admin/profile` | Profile & site settings (name, headline, bio, education, interests, LinkedIn, email, home intro, footer, default SEO) |

Draft previews: admins can open any draft's public URL directly — non-admins get a 404
and the page is `noindex`.

---

## Database & schema migrations (Supabase)

`SiteSettings` (singleton) · `Project` · `ResearchArticle` · `Category` · `Tag` (m2m) ·
`Skill` · `MediaAsset` · `ContentRevision` (snapshot history) · `AuditLog` (actor/action/timestamp).

The SQL migrations in `supabase/migrations/` are the authoritative database DDL and
are kept in lock-step with `prisma/schema.prisma`:

| File | What it does |
|---|---|
| `0001_init.sql` | Creates all tables, unique slugs, status indexes and FK relations (`SetNull` for categories/covers) — generated from the Prisma schema |
| `0002_rls.sql` | Enables **Row Level Security on every table** and grants anon/authenticated read access to *published* content only. No API-role writes are possible; all mutations go through the server-side admin (Prisma connection). `ContentRevision` and `AuditLog` have no policies at all (API-invisible) |
| `0003_storage.sql` | Creates the public `media` Storage bucket (8 MB, JPEG/PNG/WebP/PDF allowlist) + public read policy. Uploads happen server-side with the service-role key after admin auth and magic-byte validation |

### Applying the schema

**Option A — Supabase SQL editor / psql (recommended, no CLI needed):**
1. Open the Supabase project → SQL editor.
2. Run `supabase/migrations/0001_init.sql`, then `0002_rls.sql`, then `0003_storage.sql`.
3. (Optional bootstrap) Run `supabase/seed.sql` for the site-settings row.

**Option B — Supabase CLI:**
```bash
supabase link --project-ref <your-project-ref>
supabase db push          # applies supabase/migrations in order
```

**Option C — Prisma (schema-first):**
```bash
npm run db:push           # syncs prisma/schema.prisma to the database
```

Then seed starter content (settings, categories, skills, clearly-labelled
simulated fixtures) from your machine, pointing at Supabase:

```bash
cp .env.example .env.local    # fill in the Supabase + admin values
npm run db:seed               # prisma/seed.mjs — idempotent upserts
```

---

## Environment variables

See `.env.example`. Summary:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap, robots, llms.txt |
| `DATABASE_URL` | Supabase Postgres **pooled** connection (port 6543, pgBouncer) |
| `DIRECT_URL` | Supabase Postgres **direct** connection (port 5432) for migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (Storage) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key used for Storage uploads — never exposed client-side |
| `SUPABASE_MEDIA_BUCKET` | Storage bucket name (default `media`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin panel credentials (**change before deploying**) |
| `AUTH_SECRET` | HMAC secret for session cookies (`openssl rand -base64 32`) |

Secrets live in `.env.local` (git-ignored). Never commit them; if one leaks, rotate it.

---

## Local development

```bash
npm install
cp .env.example .env.local        # point DATABASE_URL/DIRECT_URL at (any) Postgres
npm run db:push                   # create/sync the database
npm run db:seed                   # seed settings, categories, skills + starter fixtures
npm run dev                       # http://localhost:3000
```

Without Supabase env vars the media API falls back to local `./uploads` disk
storage, so local development works with any Postgres (or even a local one).

Starter content policy: the seed creates **clearly-labelled simulated fixtures**
(synthetic-data case studies) so the design is populated on first run. They are
intended to be replaced with real work via the admin panel — they are labelled as
simulated everywhere they appear, and no credentials, employment or metrics are invented.

## Deployment (Vercel + Supabase)

1. **Supabase**: create the project, run the three migrations (above), note the
   Project URL, anon key, service-role key and the pooled/direct connection strings.
2. **Vercel**: import this GitHub repository (framework auto-detected as Next.js).
3. Add all environment variables from the table above for Production (and Preview).
4. Set `NEXT_PUBLIC_SITE_URL` to the final domain (e.g. `https://refilwemolapisi.co.za`).
5. Deploy, then verify:
   - `/api/health` → `{"status":"ok","database":"up"}`
   - `/robots.txt`, `/sitemap.xml`, `/llms.txt`
   - Admin login → publish a test project → it appears on `/projects` and in the sitemap.
6. Point your custom domain at Vercel and update `NEXT_PUBLIC_SITE_URL`.

Builds run `postinstall → prisma generate` automatically; no manual steps on Vercel.

## Backup / recovery

- **Database:** `pg_dump "$DIRECT_URL" > backup.sql` (Supabase dashboard backups on paid plans).
- **Media:** the `media` Storage bucket (generated filenames only). Supabase Storage
  is S3-backed; use `supabase storage download` or the dashboard to export.
- **Content:** every project/article edit snapshots the previous version into
  `ContentRevision` (API-protected); restoring a snapshot is a manual DB operation.

## Known limitations

- Login rate limiting is in-memory (resets on restart) — fine for a single admin.
- No interactive dashboard embeds; dashboard links are external (arbitrary iframes
  are never accepted).
- Slug changes warn about broken links rather than auto-creating redirects.
- Revision history stores snapshots but has no UI restore yet.
- Listing search uses Postgres `LIKE`; upgrade to full-text search if the corpus grows.
- No visitor analytics (deliberate, per spec).
