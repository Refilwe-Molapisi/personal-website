-- ═══════════════════════════════════════════════════════════════════════════
-- seed.sql — minimal bootstrap: the singleton site settings row.
--
-- For the full starter content (categories, skills, clearly-labelled sample
-- projects and article), prefer the application seed which shares one source
-- of truth with the Prisma schema:
--     npm run db:seed
--
-- This SQL variant is provided for users who configure the database purely
-- from the Supabase SQL editor.
-- ═══════════════════════════════════════════════════════════════════════════

insert into public."SiteSettings" (
  "id",
  "displayName",
  "headline",
  "intro",
  "biography",
  "educationSummary",
  "professionalInterests",
  "linkedinUrl",
  "publicEmail",
  "homeIntro",
  "footerText",
  "defaultMetaTitle",
  "defaultMetaDescription",
  "updatedAt"
) values (
  'singleton',
  'Refilwe Molapisi',
  'Final-year BCom Economics student · Aspiring analyst (2027 entry-level)',
  'I am a final-year BCom Economics student building a career in business intelligence, commercial analysis and economic research. I use this site to publish my analytical work: how I framed each question, what I did with the data, what I found, and what I would do differently.',
  E'I am completing a Bachelor of Commerce in Economics, with a strong interest in how data is used to answer practical business and policy questions. My coursework has covered microeconomics, macroeconomics, statistics and econometrics, and I complement it with self-directed projects in business intelligence and market research.\n\nI am looking for entry-level opportunities from 2027 in business intelligence, commercial and business analysis, market research, risk and compliance, and economic or policy research. This portfolio is where I share the evidence of how I work: the question, the data, the method, the findings and the limitations.',
  'BCom Economics (final-year student) — coursework in microeconomics, macroeconomics, statistics and econometrics.',
  E'Business intelligence\nCommercial and business analysis\nMarket research and consumer insights\nRisk, compliance and financial crime analysis\nEconomic and policy research',
  '',
  null,
  'Final-year BCom Economics student publishing honest, end-to-end analytical work — the question, the data, the method, the findings and the limitations.',
  'Independent and academic work, published to demonstrate analytical capability.',
  'Refilwe Molapisi — Analytics Portfolio',
  'Portfolio of Refilwe Molapisi, final-year BCom Economics student: projects, research and skills in business intelligence, commercial analysis and economic research.',
  now()
)
on conflict ("id") do nothing;
