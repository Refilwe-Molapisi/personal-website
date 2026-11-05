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
| Database | **SQLite via Prisma ORM** — a single file, no external services (`DATABASE_URL=file:./dev.db`). Schema is portable: flip the provider to `postgresql`/`mysql` to move to any managed database |
| Media | Disk-backed media store served via `/api/media/[id]` with signature validation |
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

## Database & schema migrations (Prisma + SQLite)

`SiteSettings` (singleton) · `Project` · `ResearchArticle` · `Category` · `Tag` (m2m) ·
`Skill` · `MediaAsset` · `ContentRevision` (snapshot history) · `AuditLog` (actor/action/timestamp).

The database is **SQLite** — Prisma manages the schema and all queries; nothing else
to install or host. The schema is tracked in `prisma/schema.prisma`, and an initial
migration lives in `prisma/migrations/20261105000000_init/` (created via
`prisma migrate diff`, so `prisma migrate deploy` works from an empty database).

Security: **all public queries go through server components that filter
`status = "published"`**, and every admin mutation calls `requireAdmin()`
server-side first. There is no database exposed to the network at all — SQLite is
a local file, which replaces the RLS layer a hosted database would need. Uploads
validate magic-byte signatures (JPEG/PNG/WebP/PDF only, ≤ 8 MB), generate random
storage names, and require alt text.

### Creating / migrating the database

**Development (recommended):**
```bash
npm run db:push           # sync prisma/schema.prisma straight to the SQLite file
npm run db:seed           # idempotent starter content (prisma/seed.mjs)
```

**Migration-based (empty database, e.g. a fresh clone or CI):**
```bash
npx prisma migrate deploy   # applies prisma/migrations/ in order
npm run db:seed
```

> Use one or the other per environment: `db:push` for fast local iteration,
> `migrate deploy` when you want the database built strictly from the tracked
> migrations. Don't mix on the same file.

### Moving to a hosted database later

The model definitions are portable. To move off SQLite (e.g. for multi-writer or
serverless deployments):
1. In `prisma/schema.prisma`, set `provider = "postgresql"` (or `"mysql"`).
2. Point `DATABASE_URL` at the managed database.
3. Regenerate the init migration for that engine
   (`npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`)
   and run it, or `npm run db:push`.
4. Update the media strategy (see Known limitations — disk storage is local).

---

## Environment variables

See `.env.example`. Summary:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap, robots, llms.txt |
| `DATABASE_URL` | Prisma connection string. SQLite: `file:./dev.db` (path relative to `prisma/schema.prisma`) |
| `UPLOAD_DIR` | Optional media directory (defaults to `./uploads`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin panel credentials (**change before deploying**) |
| `AUTH_SECRET` | HMAC secret for session cookies (`openssl rand -base64 32`) |

Secrets live in `.env` (git-ignored). Never commit them; if one leaks, rotate it.

---

## Local development

```bash
npm install
cp .env.example .env              # SQLite default works as-is (file:./dev.db)
npm run db:push                   # create/sync the database
npm run db:seed                   # seed settings, categories, skills + starter fixtures
npm run dev                       # http://localhost:3000
```

> Use `.env` (not `.env.local`) — the Prisma CLI reads `.env` from the project
> root; Next.js reads it too. `.env.local` works for the Next dev server but is
> invisible to `prisma` CLI commands.

No external database or services are needed — SQLite is a local file and media
uploads go to `./uploads` on disk.

Starter content policy: the seed creates **clearly-labelled simulated fixtures**
(synthetic-data case studies) so the design is populated on first run. They are
intended to be replaced with real work via the admin panel — they are labelled as
simulated everywhere they appear, and no credentials, employment or metrics are invented.

## Deployment

**On a VPS / always-on host (recommended for SQLite):**
1. Provision a small Linux box, install Node 20+.
2. Clone the repo, `npm ci`, create the database (`npm run db:push && npm run db:seed`),
   set `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET` in `.env`.
3. `npm run build && npm run start` (standalone server) — the included `Caddyfile`
   shows a reverse-proxy setup with TLS.

Because the host is persistent, the SQLite file and `uploads/` directory keep all
admin-managed content between restarts and deploys.

**On Vercel (serverless — important caveats):**
- The filesystem is ephemeral, so the SQLite database and `uploads/` media do not
  persist between deploys or across server instances. Set
  `DATABASE_URL=file:/tmp/dev.db` and re-run `db:push && db:seed` on each deploy
  (or via the build command `npm run db:push && npm run db:seed && next build`) to
  demo the site — but admin edits will be lost on redeploy.
- For real, persistent admin-managed content on Vercel, switch to a hosted
  database ("Moving to a hosted database later", above) and a persistent object
  storage for media.

Deploy steps either way:
1. Import this GitHub repository (framework auto-detected as Next.js).
2. Add the environment variables from the table above for Production (and Preview).
3. Set `NEXT_PUBLIC_SITE_URL` to the final domain (e.g. `https://refilwemolapisi.co.za`).
4. Deploy, then verify:
   - `/api/health` → `{"status":"ok","database":"up"}`
   - `/robots.txt`, `/sitemap.xml`, `/llms.txt`
   - Admin login → publish a test project → it appears on `/projects` and in the sitemap.
5. Point your custom domain and update `NEXT_PUBLIC_SITE_URL`.

Builds run `postinstall → prisma generate` automatically; no manual framework steps needed.

## Backup / recovery

- **Database:** SQLite is a single file — back up `prisma/dev.db` (`sqlite3 dev.db ".backup backup.db"` or plain file copy while the server is stopped). To export to SQL: `sqlite3 dev.db .dump > backup.sql`.
- **Media:** back up the `uploads/` directory (generated filenames only).
- **Content:** every project/article edit snapshots the previous version into
  `ContentRevision`; restoring a snapshot is a manual DB operation.

## Known limitations

- Login rate limiting is in-memory (resets on restart) — fine for a single admin.
- No interactive dashboard embeds; dashboard links are external (arbitrary iframes
  are never accepted).
- Slug changes warn about broken links rather than auto-creating redirects.
- Revision history stores snapshots but has no UI restore yet.
- Listing search uses SQLite `LIKE`; upgrade to full-text search or a hosted
  Postgres if the corpus grows.
- SQLite is single-writer: ideal for this portfolio's read-mostly traffic with one
  admin, but not for concurrent heavy writes.
- Media lives on local disk — on ephemeral hosts (serverless) uploads need a
  persistent volume or object storage.
- No visitor analytics (deliberate, per spec).
