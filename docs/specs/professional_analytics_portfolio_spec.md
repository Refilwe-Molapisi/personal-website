# Professional Analytics Portfolio Website
## Complete Product Requirements and Implementation Specification

## 1. Project purpose

Build a professional portfolio website for a final-year BCom Economics student seeking entry-level roles for 2027 in:

- Business intelligence (BI)
- Commercial and business analysis
- Market research and consumer insights
- Risk, compliance and financial crime analysis
- Economic and policy research

The website is a job-search and professional-evidence platform. It is not a business, agency, consulting service, personal brand sales funnel, or CV-download landing page.

### Primary goals

1. Give recruiters one memorable URL where they can review the owner's work.
2. Demonstrate analytical thinking, technical ability, research quality and communication.
3. Let the owner create, edit, preview, publish, unpublish, archive and manage all website content through a private admin panel.
4. Keep content manageable without editing code or redeploying for ordinary content changes.
5. Work well on mobile, tablet and desktop.
6. Be secure, accessible, fast, search-engine friendly and maintainable.
7. Support ongoing growth: new projects, research articles, skills, case studies and profile updates.

### Success criteria

- A visitor can understand the owner's professional direction within 10 seconds.
- A visitor can open a project and understand its question, data, method, findings and limitations.
- The owner can publish a new project or article from the admin panel without editing source code.
- Unpublished content is never visible to public visitors.
- All forms, buttons, navigation links, filters, upload flows and admin actions work as advertised.
- The site remains useful when there are only one or two projects and scales as the portfolio grows.

---

## 2. Technical context and architecture

### Required stack

- **Application:** AI-assisted web application; preferably Next.js with TypeScript unless the existing project uses a compatible framework already.
- **Database:** Supabase Postgres.
- **Authentication:** Supabase Auth for the administrator.
- **File storage:** Supabase Storage.
- **Hosting and deployment:** Vercel.
- **Source control:** GitHub or another Git-compatible repository.
- **Domain:** A personal professional domain, connected when available.
- **Analytics:** Optional privacy-conscious website analytics; do not build visitor profiling.

Do not add a second database, authentication provider, CMS or storage provider unless there is a clear, documented need.

### Architectural principles

- Public website reads only published and publicly visible records.
- Admin routes require authenticated administrator authorization, not just a hidden URL.
- Enforce permissions in server-side code and Supabase Row Level Security (RLS); never rely on client-side hiding alone.
- Keep Supabase service-role keys and other secrets server-side only. Never expose them in browser bundles, public environment variables or repository commits.
- Use server-side validation for all mutations and validate again at database boundaries where applicable.
- Store content in the database; store uploaded files in Supabase Storage; keep only file paths and metadata in the database.
- Use stable slugs for human-readable URLs, while retaining immutable IDs as primary identifiers.
- Content edits should not require redeployment.
- Include clear loading, empty, success and failure states for all asynchronous operations.
- Do not ship mock controls that appear functional but do nothing.
- Use migrations or versioned SQL scripts for database schema changes.
- Use environment variables for local, preview and production environments.

### Suggested route map

Public routes:
- `/` — Home
- `/projects` — Projects index
- `/projects/[slug]` — Individual project
- `/research` — Research and insights index
- `/research/[slug]` — Individual research article
- `/skills` — Skills and tools
- `/about` — Professional background and approach
- `/404` or framework-equivalent not-found page
- `/privacy` — Privacy notice, if analytics or forms collect personal data
- `/robots.txt` and sitemap route/file

Admin routes:
- `/admin/login`
- `/admin` — Dashboard
- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/[id]/edit`
- `/admin/research`
- `/admin/research/new`
- `/admin/research/[id]/edit`
- `/admin/skills`
- `/admin/categories`
- `/admin/profile`
- `/admin/media`
- `/admin/settings`

Protect all `/admin` routes and admin server actions/API endpoints.

---

## 3. Public website requirements

### 3.1 Global navigation and footer

Navigation:
- Home
- Projects
- Skills & Tools
- Research & Insights
- About
- LinkedIn link

Requirements:
- LinkedIn is a prominent professional destination and opens the correct profile URL.
- Do not add a CV download button.
- Do not add Services, Pricing, Book a Call, Testimonials, Client Logos, or Contact Sales sections.
- The owner may optionally include an email address on the About page or footer, but it is not necessary to launch.
- Navigation works by keyboard, mouse, touch and screen reader.
- Mobile navigation has a functional open/close control, correct focus handling and Escape-key support.
- Active navigation state is clear.
- Footer includes the owner's name, current academic/professional descriptor where appropriate, LinkedIn, copyright year generated automatically, and links to relevant public sections.
- External links should be clearly identifiable and use safe target/rel attributes when opening a new tab.

### 3.2 Home page

Purpose: quickly communicate professional focus and direct visitors to evidence of capability.

Sections:
1. **Professional introduction**
   - Name.
   - Concise introduction.
   - BCom Economics status, accurately worded and editable from admin.
   - Focus areas: BI/commercial analysis, market research, and economic analysis/research.
   - Do not claim a qualification, role, certification, proficiency or work experience that has not been earned.
2. **Selected projects**
   - Show projects flagged as featured in admin.
   - Each card includes title, short summary, category, tools and cover image where available.
   - Each card links to its own project page.
   - If no projects are featured, show a deliberate, professional empty state or omit the section; never display fake projects.
3. **Research and insights**
   - Show selected or recent published articles.
   - Include title, summary, category/topic and publication date.
4. **Skills preview**
   - Display a small selection of skills with truthful proficiency labels or status.
   - Link to the complete Skills & Tools page.
5. **LinkedIn destination**
   - A clear, accessible link to the owner's LinkedIn profile.

Home page content should be editable from the admin panel, including intro text, section headings, featured items and LinkedIn URL.

### 3.3 Projects index

Requirements:
- List published projects only.
- Search projects by title and summary.
- Filter by category and, if practical, tools used.
- Sort by featured, newest, oldest or title, where useful.
- Use pagination or a load-more pattern when the collection becomes large; avoid rendering an unlimited list.
- Preserve filter/search state in the URL when practical so links can be shared.
- Each card shows title, summary, category, tools, cover image and publication date if relevant.
- Empty results show a helpful message and a way to clear filters.
- Do not show drafts, archived projects, admin-only metadata or private file URLs.
- Do not invent engagement metrics such as view counts.

### 3.4 Individual project page

Each project should support these fields/sections, but optional fields should not render empty headings:

- Title
- URL slug
- Short summary
- Cover image
- Project category
- Project type: academic, self-directed, simulated case study, internship/work (only if truthful)
- Status label if useful, e.g. completed or in progress
- Date or period completed
- Tools and methods
- Problem statement / research question
- Context and objective
- Dataset description and source links
- Data period, units and geographic coverage
- Data licence or usage note where relevant
- Data quality issues and cleaning decisions
- Methodology and assumptions
- Analysis steps
- Results and findings
- Visualisations, screenshots, charts or embedded dashboard
- Recommendations or implications
- Limitations and uncertainty
- What the owner learned / possible next steps
- Code repository link
- Interactive dashboard link or embed, if supported and safe
- Supporting files/downloads, e.g. report PDF or sample dataset where permitted
- Citations and references
- Related projects
- Last updated date
- Back to projects link

Project content:
- Must support headings, paragraphs, lists, tables, links, images and code blocks where needed.
- Code should be readable and safely rendered, not executed by the website.
- External embeds must be restricted to explicitly allowed providers; do not permit arbitrary iframe HTML.
- If a dashboard cannot be embedded, show a clear external link instead.
- Images have alt text; captions and sources are supported.
- Display a clear note where a dataset is synthetic or simulated.
- Never expose confidential, licensed, personal or restricted data without permission.
- Support draft preview before publication.
- Changing a slug should either create a redirect from the old slug or require explicit confirmation that old links will break.
- Related-project links should resolve to published items only.

### 3.5 Skills & Tools page

Requirements:
- Organise skills into editable groups, such as:
  - Data analysis and BI
  - Programming and databases
  - Statistics and quantitative methods
  - Business and commercial analysis
  - Research and writing
  - Risk/compliance (only as skills are actually developed)
- Each skill may include:
  - Name
  - Category/group
  - Proficiency/status label
  - Short explanation
  - Evidence links to relevant projects
  - Optional learning resource
  - Display order
- Suggested status vocabulary:
  - Learning
  - Practising
  - Project experience
  - Confident
- Use labels that do not imply formal certification.
- Avoid unsupported numeric percentages such as “90% proficient.”
- Skills and statuses must be editable through admin.
- Link skills to evidence where possible; do not display a tool as a demonstrated strength if there is no evidence yet.
- Provide a short explanation that proficiency is self-assessed if proficiency labels are used.

### 3.6 Research & Insights index

Requirements:
- Display published research articles and briefs only.
- Search by title and summary.
- Filter by topic/category and optionally content type.
- Sort by publication date.
- Each card includes title, summary/abstract, topic, publication date and estimated reading time if it can be calculated reliably.
- Provide clear empty and no-results states.
- Do not mix unpublished drafts into public lists.

### 3.7 Individual research article

Fields/sections:
- Title and slug
- Summary or abstract
- Topic/category
- Publication date
- Last updated date
- Reading time (calculated or manually set)
- Full article body
- Research question
- Main argument or findings
- Data and methodology, where applicable
- Limitations and caveats
- Sources, references and citations
- Charts, tables and images with captions and sources
- Optional downloadable PDF
- Related articles/projects
- Optional tags
- Content type: research brief, market commentary, policy analysis, literature review, data note or other
- Disclosure that work is independent/academic/self-directed where appropriate

Requirements:
- Use consistent citation formatting chosen by the owner.
- Every source link should work and be distinguishable from the owner's own claims.
- Do not fabricate references or publication details.
- Support draft, preview, publish, unpublish and archive.
- Show publication and revision dates accurately.
- Avoid presenting exploratory correlation as causation.
- Support a clear correction/update note when an important published conclusion changes.

### 3.8 About page

Requirements:
- Editable professional biography.
- Degree/programme and study status, accurately represented.
- Professional interests and career directions.
- Analytical approach and research interests.
- LinkedIn link.
- Optional professional email address.
- Do not include private home address, personal identification numbers, private phone number or other unnecessary sensitive details.
- No invented work experience, client claims, awards, qualifications or testimonials.

### 3.9 Not-found and error pages

- Provide a useful 404 page with links to Home, Projects and Research.
- Show friendly error states without leaking stack traces, database errors, internal IDs or secrets.
- If an item is unpublished or deleted, public visitors should not be able to access its content by guessing its URL.
- Do not expose whether a private draft exists unless there is a deliberate reason.

---

## 4. Admin panel requirements

### 4.1 Admin authentication and access control

- One owner/admin account is sufficient for initial launch.
- Login uses Supabase Auth.
- No public registration or user account creation.
- Do not hardcode passwords or create a shared admin password in source code.
- Prefer a secure sign-in flow supported by Supabase Auth.
- Add logout.
- Protect admin pages and every mutation endpoint/server action.
- Verify administrator status server-side.
- Use least-privilege access.
- Apply RLS to every table that contains editable content or private metadata.
- Public users may read only records explicitly published and public.
- Only the authorised administrator may create, edit, publish, unpublish, archive or delete content.
- Do not rely on obscurity of `/admin`.
- Never expose the Supabase service-role key to the browser.
- Apply rate limiting or abuse protection to login-sensitive flows where appropriate.
- Use secure cookies/session handling as appropriate for the chosen framework.
- Provide a safe process to recover account access; do not add an insecure password-reset backdoor.

### 4.2 Admin dashboard

Display:
- Total published projects
- Total project drafts
- Total published research articles
- Total research drafts
- Recently updated content
- Quick actions: New Project, New Research Article, Manage Skills, Edit Profile
- Optional setup warnings, e.g. missing LinkedIn URL, missing meta description or no featured project

Do not add fake traffic metrics or vanity analytics by default.

### 4.3 Project management

The owner must be able to:
- Create a project
- Edit a project
- Duplicate a project as a starting point
- Save draft
- Preview draft as it will appear publicly
- Publish
- Unpublish
- Archive
- Restore from archive
- Delete after a confirmation step
- Mark/unmark as featured
- Change display order if relevant
- Add/remove categories and tools
- Upload/change/remove cover image
- Upload/add/remove project screenshots and supporting files
- Add/edit code and dashboard links
- Add/edit sources and citations
- See created and last-updated timestamps
- See validation errors beside the relevant fields
- Receive a success/error message after each action

Deletion should require confirmation and explain whether related uploaded files will also be deleted. Prefer soft-delete/archive for routine removal; permanent deletion should be deliberate.

### 4.4 Research management

Provide the same lifecycle controls as projects:
- Create/edit/duplicate
- Draft/preview/publish/unpublish/archive/restore/delete
- Topic and tag assignment
- Body editor
- Sources/citations editor
- Image/chart/table support
- Optional PDF upload
- Publication date and update date
- Featured article selection
- SEO metadata
- Validation and action feedback

### 4.5 Rich text and content editor

- Support headings, paragraphs, bold/italic, ordered/unordered lists, links, tables, block quotes, images, captions, code blocks and horizontal rules.
- Store content in a format that is safe and maintainable (e.g. structured JSON from a trusted editor, or sanitised Markdown).
- Sanitize any HTML before rendering.
- Do not execute user-supplied HTML or JavaScript.
- Add accessible keyboard controls.
- Show word count if useful.
- Autosave may be included, but if it is, clearly show saving/saved/error state and avoid silently overwriting changes.
- Warn before navigating away with unsaved changes.
- Include a preview mode.
- Support pasting formatted text without importing unsafe markup.
- Image alt text should be required or strongly prompted.
- Link editor should support descriptive link text rather than “click here.”
- Code blocks should support language labels.
- Support citation/reference entries and source URLs.

### 4.6 Media library and file uploads

Admin media library should allow:
- Upload images and documents
- View existing uploads
- Search/filter by filename or file type
- See file type, size, upload date and alt text/caption where relevant
- Copy the public URL only for assets intentionally public
- Reuse an existing asset
- Replace an asset without breaking references where possible
- Remove unused assets safely
- See where an asset is used, if practical

Validation:
- Allow only necessary file types, e.g. JPEG, PNG, WebP, SVG only if sanitised/strictly controlled, and PDF.
- Prefer raster formats for user-uploaded images; avoid untrusted SVG unless sanitised.
- Set file-size limits appropriate to the app.
- Check actual file type, not only extension or client-provided MIME type.
- Generate safe unique storage paths; do not trust uploaded filenames as paths.
- Prevent executable uploads.
- Use image optimisation and sensible dimensions.
- Require alt text for meaningful images.
- Do not put secrets or private documents in a public bucket.
- Use public buckets only for intentionally public content; private files should use authenticated access or short-lived signed URLs.
- Ensure deleting a content record does not unexpectedly delete files used elsewhere.
- Show upload progress and actionable errors.
- Avoid storing large binary files directly in Postgres.

### 4.7 Skills manager

Admin can:
- Create/edit/delete skill entries
- Set group/category
- Set display status/proficiency
- Add description and evidence links
- Reorder skills
- Hide a skill from the public page without deleting it

### 4.8 Categories and tags manager

Admin can:
- Create/edit/delete categories
- Assign categories to projects and articles
- Create/edit/delete tags
- See content using each category/tag
- Prevent deletion or warn when a category is in use
- Avoid duplicate slugs and names
- Set display order

Suggested initial project categories:
- Business Intelligence
- Commercial Analysis
- Market Research
- Economic Analysis
- Risk Analysis

Suggested research topics can be broader and independently managed.

### 4.9 Profile and site settings

Editable settings:
- Owner display name
- Professional headline/descriptor
- Introduction and biography
- Education details and current study status
- Professional interests
- LinkedIn URL
- Optional public email
- Homepage intro
- Featured projects/articles
- Footer text
- Default meta title and description
- Site URL and canonical domain
- Social preview image
- Default share image
- Time zone for publication scheduling
- Optional privacy/analytics settings
- Optional site maintenance mode

Never include private address, national ID, personal account details or other information irrelevant to employment.

### 4.10 Search and filtering in admin

- Search projects/articles by title.
- Filter by status, category, date and content type.
- Sort by created date, updated date, title and publication date.
- Display useful pagination for large lists.
- Show draft/published/archived states clearly.
- Do not make the admin list rely on loading every record at once.

### 4.11 Publishing lifecycle

Supported states:
- Draft
- Published
- Archived

Rules:
- New content defaults to Draft.
- Only Published + public content appears on the public website, sitemap, feeds (if added), search results and related-content modules.
- Unpublishing removes content from public lists and public detail routes.
- Archive removes content from public routes and ordinary admin active lists, but keeps it recoverable.
- Permanent delete requires confirmation.
- Publish action validates required fields and prevents publishing invalid content.
- Future publication scheduling is optional; if implemented, it must use the configured time zone and be tested.
- Record created_at, updated_at and published_at.
- Avoid updating published_at on every edit; distinguish initial publication from last modification.

### 4.12 Audit and revision history

Recommended:
- Track who changed a record (even if there is only one admin), action and timestamp.
- Keep a limited revision history for project/article content so accidental edits can be recovered.
- Do not log passwords, access tokens, secrets or full private session data.
- Provide a restore option only if revision history is implemented safely.

---

## 5. Data model for Supabase

Use UUID primary keys where appropriate, foreign keys, indexes, constraints and timestamps. Exact schema may be adapted to the selected framework, but it must cover the following entities.

### 5.1 `profiles` or `site_settings`

Stores the single public professional profile and global settings:
- `id`
- `display_name`
- `headline`
- `intro`
- `biography`
- `education_summary`
- `professional_interests`
- `linkedin_url`
- `public_email` (nullable)
- `home_intro`
- `footer_text`
- `default_meta_title`
- `default_meta_description`
- `og_image_path`
- `updated_at`

Avoid placing admin credentials in this table.

### 5.2 `projects`

Suggested fields:
- `id`
- `title`
- `slug` (unique)
- `summary`
- `cover_image_path` (nullable)
- `category_id` (nullable)
- `project_type`
- `project_status_label` (nullable)
- `project_date` (nullable)
- `tools` (array or relation table)
- `research_question`
- `context`
- `dataset_description`
- `dataset_source_urls`
- `data_period`
- `geographic_coverage`
- `licence_notes`
- `data_cleaning_notes`
- `methodology`
- `analysis_content` (structured body)
- `findings`
- `recommendations`
- `limitations`
- `lessons_and_next_steps`
- `repository_url` (nullable)
- `dashboard_url` (nullable)
- `dashboard_embed_provider` (nullable)
- `supporting_files` (metadata/paths, or related table)
- `references` (structured data or related table)
- `related_project_ids` (prefer relation table if relational integrity is needed)
- `is_featured`
- `display_order`
- `visibility` (public/private, if required)
- `status` (draft/published/archived)
- `meta_title`
- `meta_description`
- `canonical_url` (optional)
- `created_at`
- `updated_at`
- `published_at`
- `archived_at` (nullable)

Avoid a single enormous unstructured text field for all content if the editor requires individual sections. Structured content is easier to validate and display consistently.

### 5.3 `research_articles`

Suggested fields:
- `id`
- `title`
- `slug` (unique)
- `summary` or `abstract`
- `content` (structured body)
- `topic_id` (nullable)
- `content_type`
- `tags` or tag relation
- `research_question` (nullable)
- `methodology` (nullable)
- `findings` (nullable)
- `limitations` (nullable)
- `references` (structured data or related table)
- `cover_image_path` (nullable)
- `pdf_path` (nullable)
- `reading_time_minutes` (nullable/calculated)
- `is_featured`
- `display_order`
- `status`
- `published_at`
- `updated_at`
- `archived_at` (nullable)
- `meta_title`
- `meta_description`
- `canonical_url` (optional)
- `created_at`

### 5.4 `categories`

- `id`
- `name`
- `slug` (unique)
- `content_type` (project/research/both)
- `description` (nullable)
- `display_order`
- `created_at`
- `updated_at`

### 5.5 `tags` and relation tables

If tags are needed:
- `tags`: `id`, `name`, `slug`
- `project_tags`: `project_id`, `tag_id`
- `article_tags`: `article_id`, `tag_id`

Use foreign keys and uniqueness constraints to prevent duplicate assignments.

### 5.6 `skills`

- `id`
- `name`
- `slug`
- `group_name` or `skill_group_id`
- `status_label`
- `description`
- `display_order`
- `is_visible`
- `created_at`
- `updated_at`

Consider `skill_evidence` for many-to-many links between skills and projects/articles.

### 5.7 `media_assets`

- `id`
- `storage_bucket`
- `storage_path`
- `original_filename`
- `mime_type`
- `file_size_bytes`
- `alt_text`
- `caption`
- `is_public`
- `uploaded_by`
- `created_at`
- Optional dimensions for images

### 5.8 `content_revisions` (recommended)

- `id`
- `content_type`
- `content_id`
- `revision_number`
- `snapshot` (structured content snapshot)
- `created_by`
- `created_at`

Apply retention limits and do not store secrets.

### 5.9 `admin_audit_log` (recommended)

- `id`
- `admin_user_id`
- `action`
- `content_type`
- `content_id`
- `metadata` (safe, minimal)
- `created_at`

Never store credentials, access tokens or sensitive request bodies in audit metadata.

### 5.10 Relational integrity and indexes

- Unique constraints for slugs.
- Index status and published_at for public queries.
- Index category relationships and any search fields used frequently.
- Foreign keys for categories and relation tables.
- Ensure deleting a category does not silently orphan content; restrict, reassign or require explicit confirmation.
- Use transactions for multi-step mutations when needed.
- Use database migrations tracked in source control.

---

## 6. Supabase security and Row Level Security

RLS is mandatory for all tables exposed through Supabase APIs.

### Public read policies

Public visitors may read:
- Profile/site settings fields intended for public display.
- Projects where status is `published` and visibility is `public`.
- Research articles where status is `published` and visibility is `public`.
- Visible skills.
- Public categories and tags needed for navigation/filtering.
- Public media metadata and public assets intended for published content.

Public visitors must not read:
- Draft or archived content.
- Private profile/settings fields.
- Admin audit logs.
- Content revisions.
- Private file metadata.
- Admin user lists or internal identifiers where unnecessary.

### Admin mutation policies

- Only explicitly authorised admin users may insert/update/delete content.
- Do not assume any authenticated Supabase user is an administrator.
- For a single-owner site, use an explicit allowlist/role claim or a dedicated admin-role table with secure policies.
- Ensure the mechanism used to check admin status cannot be modified by the user it is intended to restrict.
- Keep authorization checks consistent between database policies and server-side routes.
- Verify admin status for every write, including uploads, publish actions, slug changes and deletes.

### Storage policies

- Public bucket only for intentionally public portfolio assets.
- Private bucket for private drafts or restricted files.
- Ensure draft cover images and documents are not inadvertently publicly accessible.
- Validate uploads server-side and apply size/type limits.
- Use signed URLs for private files and short expiration windows.
- Avoid predictable filenames and path traversal.
- Do not use the service-role key in client code.

### Secrets and environment variables

- Store keys in Vercel environment settings and local `.env.local`.
- Keep `.env.local` out of Git.
- Use the public/anon key only where appropriate for client usage with RLS in place.
- Use service-role credentials only on trusted server-side code when necessary.
- Rotate any key accidentally committed or exposed.
- Never include secrets in logs, error messages or generated client bundles.

---

## 7. File uploads and embeds

### Uploads

- Use an allowlist of file types.
- Verify content type and file signature where practical.
- Enforce maximum file size and image dimensions.
- Rename files using safe generated identifiers.
- Sanitize filenames shown in the UI.
- Show upload progress and clear errors.
- Handle network interruptions and retry safely.
- Prevent duplicate upload submissions.
- Confirm removal before deleting a file.
- Check whether a file is referenced elsewhere before removal.
- Optimise images and use responsive sizes.
- Add alt text and optional captions.
- Do not upload datasets or documents containing personal/confidential data.

### Embeds

- Support approved providers only, for example a configured Power BI embed mode or other known dashboard provider.
- Do not accept arbitrary iframe or script code from the admin editor.
- Validate URLs against an allowlist.
- Provide a fallback external link if embedding is unavailable.
- Use privacy-appropriate embed settings.
- Explain when a dashboard requires a viewer login or permissions.
- Never expose secret embed tokens in page source.
- Respect the third-party platform's terms and sharing permissions.

---

## 8. Search, metadata and discoverability

### Search engine optimisation

- Unique title and meta description for every public page.
- Canonical URL for each public page.
- Open Graph and social preview metadata.
- Sitemap includes only canonical public URLs.
- `robots.txt` permits indexing of public content and blocks admin routes where appropriate.
- Noindex admin, login, preview and unpublished pages.
- Use semantic HTML and a logical heading hierarchy.
- Descriptive slugs; avoid random IDs in public URLs.
- Use descriptive link text and meaningful image alt text.
- Add structured data only when accurate and useful, such as `Person`, `WebSite`, `Article` or `CreativeWork`.
- Do not add fake ratings, reviews, organisation details or employment claims.
- Ensure the canonical domain is consistent after domain setup.

### Search behaviour

- Public project and research search should search relevant title and summary fields at minimum.
- Search should be case-insensitive where appropriate.
- Filters should combine predictably.
- Query parameters should be validated.
- Avoid leaking unpublished records through search suggestions, counts or API responses.
- Consider Postgres full-text search only if basic search becomes inadequate.

### Social sharing

- Use correct Open Graph title, description and image.
- Ensure a copied project URL opens the correct project page.
- Do not force a visitor to sign in to view public work.

---

## 9. Accessibility, responsive behaviour and usability

- Aim for WCAG 2.2 AA where practical.
- Full keyboard navigation.
- Visible focus indicators.
- Correct labels for inputs.
- Accessible validation and error messages.
- Sufficient text/background contrast.
- Alt text for meaningful images; empty alt for decorative images.
- Do not use colour as the only status indicator.
- Respect reduced-motion preferences.
- Support zoom and reflow on small screens.
- Avoid horizontal scrolling except for tables/code where a contained scroll region is appropriate.
- Mobile navigation and admin forms must be usable on a phone.
- Buttons have meaningful labels and adequate touch targets.
- Forms preserve user input when validation fails.
- Dialogs trap focus correctly and return focus on close.
- Empty, loading, success, error and offline states are designed deliberately.
- Avoid layout shifts from images and embedded dashboards.

---

## 10. Performance and reliability

- Optimise and resize images.
- Lazy-load below-the-fold images and embeds.
- Avoid loading large interactive dashboards on every page.
- Use caching/revalidation for public content, with a clear invalidation strategy after publish/unpublish/edit.
- Ensure a newly published project appears promptly without requiring a full redeployment.
- Avoid unnecessary client-side JavaScript.
- Paginate large lists.
- Use indexes for public queries.
- Avoid N+1 database queries.
- Add timeouts and friendly fallback states for failed external embeds.
- Use Vercel preview deployments to test changes before production.
- Keep dependencies updated and remove unused packages.
- Provide error monitoring if practical; never send secrets or sensitive content to monitoring services.
- Define backup/export procedures for database content and media.

---

## 11. Privacy and legal considerations

- Collect as little visitor data as possible.
- Do not create visitor accounts or comments for the first version.
- If analytics, contact forms or other tracking are added, explain data use in a privacy notice and comply with applicable law, including South Africa's POPIA where relevant.
- Avoid adding a contact form unless there is a genuine use case. LinkedIn may be sufficient initially.
- If a contact form is later added, include validation, spam protection, rate limiting and clear retention rules.
- Only publish personal contact information the owner deliberately chooses to make public.
- Use datasets and images with appropriate licences/permissions and provide attribution.
- Do not republish proprietary datasets, paid research, confidential employer material or personal data without permission.
- Add a disclaimer where appropriate that independent research is educational/analytical and does not constitute financial, legal or investment advice.
- Do not imply endorsement by universities, employers, data providers or third parties.

---

## 12. Content quality and professional integrity

- Never invent employment, internships, clients, research partnerships, publications, qualifications, grades, certifications or awards.
- Clearly distinguish academic, self-directed, simulated and professional work.
- Label synthetic data.
- Cite datasets and external sources.
- State assumptions and limitations.
- Distinguish correlation from causation.
- Avoid claiming a tool proficiency that cannot be demonstrated.
- Ensure all charts use accurate scales, labels, units and dates.
- Explain the question and implication, not just the code.
- Remove personal or confidential information from notebooks and screenshots.
- Review every project for spelling, broken links and reproducibility before publication.
- Do not fabricate visitor metrics or claim a project produced real business outcomes when it was a case study.
- Clearly identify exploratory analyses and uncertainty.

---

## 13. Analytics and optional future features

Do not overbuild the first release. These are optional and should be added only when they solve a real need:

- Privacy-conscious page analytics
- Broken-link checker
- Project/article revision restore
- Scheduled publication
- RSS feed for research articles
- Downloadable research PDFs
- Content export to Markdown/JSON
- A private backup/export dashboard
- Sitemap regeneration/revalidation after content updates
- Optional contact form
- Optional theme toggle
- Optional language support
- Optional project tags and advanced filters
- Optional reading-time display
- Optional related-content recommendations

Avoid:
- Visitor accounts
- Public comments
- Newsletter subscriptions without a clear need
- Chatbots
- E-commerce
- Booking systems
- Service offerings
- Testimonials or client logos
- Fake view counters
- Complex animations
- CV download button
- Unnecessary dashboards showing vanity metrics

---

## 14. Testing and acceptance criteria

### Public pages
- [ ] All navigation and footer links work.
- [ ] LinkedIn opens the correct profile.
- [ ] No CV download button appears.
- [ ] Home page has no fabricated content.
- [ ] Project and research indexes show only published public records.
- [ ] Search and filters work together.
- [ ] Project pages render every populated field correctly.
- [ ] Research articles render citations, tables, images and links correctly.
- [ ] Missing optional fields do not create empty headings or awkward gaps.
- [ ] Related content only links to published records.
- [ ] Unknown or unpublished slugs return an appropriate not-found response.
- [ ] Mobile, tablet and desktop layouts work.
- [ ] Keyboard navigation and accessible labels work.
- [ ] Page titles, descriptions, canonical URLs, sitemap and robots rules are correct.
- [ ] No secret keys or draft data appear in page source or network responses.

### Admin
- [ ] Unauthenticated visitors cannot access admin pages or mutation endpoints.
- [ ] A non-admin authenticated user cannot perform admin actions.
- [ ] Login, logout and session expiry work.
- [ ] Admin can create, edit, preview, publish, unpublish, archive, restore and delete projects.
- [ ] Admin can perform the same actions for research articles.
- [ ] Admin can manage skills, categories, tags and profile settings.
- [ ] Admin can upload, reuse and remove media safely.
- [ ] Invalid forms show useful validation messages.
- [ ] Unsaved changes are not silently lost.
- [ ] Drafts remain private.
- [ ] Published content appears publicly after publication without redeploying.
- [ ] Unpublished content disappears from public listings and direct routes.
- [ ] Slug changes are handled safely.
- [ ] Failed uploads and failed database operations show clear errors.
- [ ] Delete operations require confirmation.
- [ ] No dummy buttons or non-functional UI remain.

### Database and security
- [ ] RLS enabled for all relevant tables.
- [ ] Policies tested as anonymous, authenticated non-admin and admin.
- [ ] Storage policies tested for public and private assets.
- [ ] Service-role key is server-only.
- [ ] Secrets are absent from Git history and browser bundles.
- [ ] Schema migrations are versioned.
- [ ] Foreign keys and uniqueness constraints work.
- [ ] Public queries cannot retrieve drafts or archived records.
- [ ] Admin audit/revision data is private.
- [ ] Backup and restore process is documented.

### Quality and deployment
- [ ] Production build passes.
- [ ] Type checking passes.
- [ ] Linting passes.
- [ ] Critical user flows have automated or documented manual tests.
- [ ] Vercel preview deployment is checked before production.
- [ ] Environment variables are configured separately for preview and production.
- [ ] Custom domain and HTTPS work, if configured.
- [ ] Database and storage backups are understood.
- [ ] Broken links and mobile rendering have been checked.

---

## 15. Recommended implementation order

### Phase 1 — Foundation
1. Inspect the existing repository and confirm the framework.
2. Set up environment variables and safe Supabase client/server utilities.
3. Create schema migrations.
4. Enable RLS and test permissions.
5. Set up authentication and the admin allowlist/role.
6. Establish storage buckets and policies.
7. Add deployment previews and a working production build.

### Phase 2 — Public site
1. Implement shared layout and navigation.
2. Build Home, Projects, Project Detail, Skills, Research, Article Detail and About.
3. Add LinkedIn links and footer.
4. Add empty, loading, error and not-found states.
5. Add SEO metadata, sitemap and robots rules.
6. Test responsive and accessible behaviour.

### Phase 3 — Admin content management
1. Admin login and dashboard.
2. Project CRUD and publication workflow.
3. Research/article CRUD and publication workflow.
4. Media library and uploads.
5. Skills management.
6. Categories/tags management.
7. Profile/site settings.
8. Preview, unsaved-change warning, validation and confirmation dialogs.

### Phase 4 — Hardening
1. Test RLS and Storage policies with different roles.
2. Test draft isolation and publication invalidation.
3. Check file type and size validation.
4. Test all links, forms, filters and actions.
5. Check mobile, keyboard accessibility and performance.
6. Verify metadata, sitemap and indexing controls.
7. Verify backup/export and recovery procedures.
8. Deploy to production only after the acceptance checklist passes.

### Phase 5 — Content
1. Add an accurate professional profile.
2. Publish the first strong BI/commercial project.
3. Publish an economic data analysis.
4. Publish a market research case study.
5. Add supporting evidence and skills links.
6. Review all claims, citations, licences and screenshots before publication.

---

## 16. Instructions for the AI coding agent

Use this document as the product requirements specification. Before changing code:

1. Inspect the existing repository, framework, package manager, current routes, Supabase setup, Vercel configuration and existing design implementation.
2. Preserve the existing approved visual design and design tokens. Do not invent a new visual style or redesign the site.
3. Identify existing functionality and reuse it where sound; do not duplicate systems unnecessarily.
4. Report any assumptions or conflicts with the current architecture.
5. Implement in small, testable phases rather than generating the entire application in one unverified pass.
6. Create and track database migrations.
7. Implement and test RLS and Storage policies before exposing content publicly.
8. Use real database operations, real authentication and real upload flows. Do not substitute mock data for required functionality in the finished implementation.
9. Do not invent profile details, projects, skills, publications, credentials or metrics. Use clearly marked development fixtures only in a non-production environment and do not seed fabricated public content.
10. Do not expose secrets or private data.
11. Run type checks, linting, production build and relevant tests.
12. Test public and admin flows, including anonymous/non-admin access and draft isolation.
13. Maintain a checklist of completed requirements and unresolved issues.
14. If a requirement cannot be implemented because a provider setting or credential is missing, explain the exact blocker and provide the next action rather than silently pretending it works.
15. Do not deploy destructive database changes or permanently delete production data without explicit approval.
16. Before final handoff, provide:
    - Implemented features
    - Routes created
    - Database tables/migrations
    - RLS and storage policy summary
    - Environment variables required (names only; never values)
    - Tests and build results
    - Known limitations
    - Deployment steps
    - Backup/recovery instructions

**Definition of done:** the public portfolio is genuinely usable, the owner can manage content from the secured admin panel, all published content comes from Supabase, unpublished content remains private, uploads are handled safely, deployment works on Vercel, and the critical acceptance checklist passes.
