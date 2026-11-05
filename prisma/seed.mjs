/**
 * Seed script — creates site settings, categories, skills and clearly-marked
 * STARTER fixtures so the owner can see the design populated before adding
 * real work via the admin panel.
 *
 * Per spec §16.9: no fabricated credentials, employment or metrics. Every
 * seeded project/article is explicitly labelled as a simulated/self-directed
 * learning exercise using synthetic data, and is intended to be replaced or
 * deleted by the owner from the admin panel.
 *
 * Run with: npm run db:seed   (reads DATABASE_URL from .env at the project root)
 */
import { readFileSync, existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

// Minimal .env loader: plain `node` does not load .env files (unlike Next.js
// or the Prisma CLI), so seed runs keep working with a plain project .env.
if (!process.env.DATABASE_URL) {
  for (const p of [".env", "prisma/.env"]) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
    break;
  }
}

const db = new PrismaClient();

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CATEGORIES = [
  { name: "Business Intelligence", contentType: "project", displayOrder: 1, description: "Dashboards, reporting and decision support" },
  { name: "Commercial Analysis", contentType: "project", displayOrder: 2, description: "Commercial performance and business analysis" },
  { name: "Market Research", contentType: "project", displayOrder: 3, description: "Consumer insight and market studies" },
  { name: "Economic Analysis", contentType: "both", displayOrder: 4, description: "Economic data analysis and policy research" },
  { name: "Risk Analysis", contentType: "project", displayOrder: 5, description: "Risk, compliance and financial crime analysis" },
  { name: "Market Commentary", contentType: "research", displayOrder: 6, description: "Short-form commentary on markets and the economy" },
  { name: "Data Note", contentType: "research", displayOrder: 7, description: "Short technical notes on datasets and methods" },
];

const SKILLS = [
  // Data analysis and BI
  { name: "Microsoft Excel", groupName: "Data analysis and BI", statusLabel: "Project experience", description: "Pivot tables, lookups, cleaning and charting for coursework analyses." },
  { name: "Power BI", groupName: "Data analysis and BI", statusLabel: "Practising", description: "Building interactive dashboards with DAX measures and data models." },
  // Programming and databases
  { name: "SQL", groupName: "Programming and databases", statusLabel: "Practising", description: "Querying, joins, aggregations and window functions on relational data." },
  { name: "Python (pandas, matplotlib)", groupName: "Programming and databases", statusLabel: "Practising", description: "Data wrangling, exploratory analysis and static visualisation." },
  // Statistics and quantitative methods
  { name: "Descriptive & inferential statistics", groupName: "Statistics and quantitative methods", statusLabel: "Project experience", description: "Hypothesis testing, confidence intervals and regression from econometrics coursework." },
  { name: "Econometrics", groupName: "Statistics and quantitative methods", statusLabel: "Learning", description: "Applied regression modelling for economic questions, currently deepening." },
  // Business and commercial analysis
  { name: "Business & commercial analysis", groupName: "Business and commercial analysis", statusLabel: "Practising", description: "Framing commercial problems, structuring analysis and interpreting results." },
  { name: "Requirements gathering", groupName: "Business and commercial analysis", statusLabel: "Learning", description: "Eliciting and documenting business requirements for analysis work." },
  // Research and writing
  { name: "Research & report writing", groupName: "Research and writing", statusLabel: "Project experience", description: "Academic research essays with structured argument and referencing." },
  { name: "Data storytelling & visualisation", groupName: "Research and writing", statusLabel: "Practising", description: "Turning analysis into clear narratives, charts and summaries." },
];

async function main() {
  console.log("Seeding…");

  // ── Site settings ──────────────────────────────────────────────────────────
  await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      displayName: "Refilwe Molapisi",
      headline: "Final-year BCom Economics student · Aspiring analyst (2027 entry-level)",
      intro:
        "I am a final-year BCom Economics student building a career in business intelligence, commercial analysis and economic research. I use this site to publish my analytical work: how I framed each question, what I did with the data, what I found, and what I would do differently.",
      biography:
        "I am completing a Bachelor of Commerce in Economics, with a strong interest in how data is used to answer practical business and policy questions. My coursework has covered microeconomics, macroeconomics, statistics and econometrics, and I complement it with self-directed projects in business intelligence and market research.\n\nI am looking for entry-level opportunities from 2027 in business intelligence, commercial and business analysis, market research, risk and compliance, and economic or policy research. This portfolio is where I share the evidence of how I work: the question, the data, the method, the findings and the limitations.",
      educationSummary: "BCom Economics (final-year student) — coursework in microeconomics, macroeconomics, statistics and econometrics.",
      professionalInterests:
        "Business intelligence\nCommercial and business analysis\nMarket research and consumer insights\nRisk, compliance and financial crime analysis\nEconomic and policy research",
      homeIntro:
        "Final-year BCom Economics student publishing honest, end-to-end analytical work — the question, the data, the method, the findings and the limitations.",
      footerText: "Independent and academic work, published to demonstrate analytical capability.",
      defaultMetaTitle: "Refilwe Molapisi — Analytics Portfolio",
      defaultMetaDescription:
        "Portfolio of Refilwe Molapisi, final-year BCom Economics student: projects, research and skills in business intelligence, commercial analysis and economic research.",
    },
  });

  // ── Categories ─────────────────────────────────────────────────────────────
  for (const c of CATEGORIES) {
    await db.category.upsert({
      where: { slug: slugify(c.name) },
      update: {},
      create: { name: c.name, slug: slugify(c.name), contentType: c.contentType, displayOrder: c.displayOrder, description: c.description },
    });
  }

  // ── Skills ─────────────────────────────────────────────────────────────────
  let i = 0;
  for (const s of SKILLS) {
    i += 1;
    await db.skill.upsert({
      where: { slug: slugify(s.name) },
      update: {},
      create: { name: s.name, slug: slugify(s.name), groupName: s.groupName, statusLabel: s.statusLabel, description: s.description, displayOrder: i },
    });
  }

  // ── Starter fixtures: sample projects + 1 sample article ──────────────────
  const biCat = await db.category.findUnique({ where: { slug: "business-intelligence" } });
  const mktCat = await db.category.findUnique({ where: { slug: "market-research" } });
  const econCat = await db.category.findUnique({ where: { slug: "economic-analysis" } });
  const dataNoteCat = await db.category.findUnique({ where: { slug: "data-note" } });

  const sampleProject = async (data) => {
    await db.project.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        tools: JSON.stringify(data.tools),
        references: JSON.stringify(data.references),
        statusLabel: "Completed",
        projectDate: "2026",
        dataNotice: "Starter example — this is a simulated case study using synthetic data generated for demonstration. Replace it with your own project from the admin panel.",
        datasetSourceUrls: JSON.stringify([]),
        isFeatured: true,
        status: "published",
        publishedAt: new Date(),
        metaTitle: data.title,
        metaDescription: data.summary.slice(0, 155),
      },
    });
  };

  await sampleProject({
    title: "Retail Sales Performance Dashboard (Simulated)",
    slug: "retail-sales-performance-dashboard",
    summary:
      "A Power BI dashboard analysing two years of simulated retail transaction data to surface revenue trends, category performance and regional patterns. Starter example — replace with your own work.",
    categoryId: biCat?.id ?? null,
    projectType: "Simulated case study",
    tools: ["Power BI", "SQL", "Excel"],
    researchQuestion: "Which product categories and regions drove revenue changes over the period, and where is performance drifting from plan?",
    context:
      "This simulated case study practises the full business intelligence workflow: shaping raw transactional data, modelling it, and building a dashboard a retail manager could actually use to run weekly category reviews.",
    datasetDescription: "Synthetic transaction-level data (~50,000 rows) generated to mimic a mid-size retailer: orders, product hierarchy, stores and regions.",
    dataPeriod: "January 2024 – December 2025",
    geographicCoverage: "Simulated South African provinces",
    methodology:
      "Star-schema data model in Power BI; DAX measures for revenue, margin and year-on-year growth; trend and cohort views; category decomposition of revenue change.",
    body:
      "## Analysis steps\n\n1. Profiled and cleaned the simulated transactions (duplicates, returns, null regions).\n2. Built a date dimension and star schema (fact sales + product, store and calendar dimensions).\n3. Wrote core DAX measures: revenue, gross margin, YoY growth and moving averages.\n4. Decomposed the year-on-year revenue change by category and region.\n5. Designed the dashboard around three questions: what changed, where, and is it trending?",
    findings:
      "- Revenue grew ~8% year on year, concentrated in two categories.\n- Two regions declined for three consecutive quarters, driven by fewer transactions rather than lower basket value.\n- Weekend trading showed the strongest basket sizes, suggesting a targeting opportunity.",
    recommendations:
      "- Investigate the declining regions with store-level analysis before drawing conclusions.\n- Track basket size alongside revenue to avoid over-reading headline growth.",
    limitations:
      "The data is synthetic, so results describe the simulation only and say nothing about any real retailer. No cost data beyond assumed margin rates was modelled.",
    lessons:
      "Modelling decisions (grain of the fact table, date handling) mattered more than any single visual. Next step: add a written narrative page to the dashboard for non-technical readers.",
    references: [{ text: "DAX pattern reference — SQLBI (learning resource)" }],
  });

  await sampleProject({
    title: "Consumer Spending Survey Analysis (Simulated)",
    slug: "consumer-spending-survey-analysis",
    summary:
      "A market research exercise analysing a simulated survey of 400 respondents on monthly spending priorities. Covers questionnaire design, cleaning, and segmentation. Starter example — replace with your own work.",
    categoryId: mktCat?.id ?? null,
    projectType: "Simulated case study",
    tools: ["Python", "pandas", "Excel"],
    researchQuestion: "How do stated spending priorities differ across income segments in the simulated sample, and what does that imply for targeting?",
    context:
      "A self-directed exercise to practise the market research workflow end to end: design a questionnaire, generate a realistic simulated response set, clean it, analyse it and report findings with appropriate caveats.",
    datasetDescription: "Synthetic survey responses (n = 400) generated to mimic a consumer spending questionnaire with demographic and attitudinal items.",
    dataPeriod: "Simulated: May 2026",
    geographicCoverage: "Simulated urban Gauteng sample",
    methodology: "Descriptive statistics, cross-tabulation by income segment, chi-square tests of association, and a simple k-means segmentation on attitudinal items.",
    body:
      "## Analysis steps\n\n1. Re-coded Likert items and handled simulated non-response.\n2. Cross-tabulated stated priorities by income segment.\n3. Tested associations with chi-square and reported effect sizes.\n4. Ran an exploratory k-means segmentation and profiled the segments.",
    findings:
      "- Essential-spending share falls and discretionary share rises across income segments, as expected.\n- The attitudinal segmentation produced three interpretable groups (value-seekers, convenience-led, brand-led).\n- Association between segment and top spending priority was statistically significant in the simulated data.",
    recommendations: "Treat the segmentation as a reusable template; validate with real data before any commercial use.",
    limitations:
      "Simulated responses do not reflect real consumer behaviour. Chi-square results on synthetic data are illustrative of method only.",
    lessons: "Questionnaire wording drives everything downstream; ambiguous items created messy re-coding even in simulated data.",
    references: [],
  });

  await sampleProject({
    title: "Inflation & Household Budgets Note (Simulated)",
    slug: "inflation-household-budgets-note",
    summary:
      "A short economic analysis exercise exploring how simulated inflation scenarios affect a modelled low-income household basket. Starter example — replace with your own work.",
    categoryId: econCat?.id ?? null,
    projectType: "Self-directed",
    tools: ["Excel", "Python"],
    researchQuestion: "How would different simulated inflation paths change the share of income a modelled low-income household spends on essentials?",
    context: "A coursework-adjacent exercise applying consumer theory and index-number logic to a clearly synthetic scenario.",
    datasetDescription: "Synthetic price series for a 20-item basket and a fixed modelled household income.",
    dataPeriod: "Simulated: 2023 – 2026",
    geographicCoverage: "Not applicable (synthetic)",
    methodology: "Laspeyres-style basket index on simulated prices; scenario analysis of three inflation paths.",
    body:
      "## Analysis steps\n\n1. Built a fixed basket and simulated monthly prices under three scenarios.\n2. Computed a Laspeyres-style index for each path.\n3. Modelled the essentials share of income under each path.",
    findings: "Under the high-path scenario, the essentials share rises fastest, compressing discretionary categories first — consistent with theory.",
    recommendations: "Use as a template for scenario work with real published data (e.g. official inflation series) once licences permit.",
    limitations: "Fixed basket ignores substitution; simulated prices only. Educational exercise, not a forecast.",
    lessons: "Index construction choices (weights, base period) materially change the story the numbers tell.",
    references: [],
  });

  const articleSeed = {
    title: "Reading a Datasets Documentation Before You Analyse (Starter Note)",
    slug: "reading-dataset-documentation-before-you-analyse",
    summary:
      "A short data note on the habit that saves the most rework: interrogating a dataset's metadata, definitions and quality notes before writing any analysis code.",
    categoryId: dataNoteCat?.id ?? null,
    contentType: "Data note",
    body:
      "## Why documentation first\n\nMost avoidable analysis mistakes I have made trace back to skipping the documentation: units that were not what they claimed, missing periods, or definitions that did not match the question.\n\n## A short checklist\n\n- What exactly does each variable measure, and in which units?\n- What period and geography does the data cover?\n- How are missing values represented, and why might they be missing?\n- Who published it, when was it last revised, and under what licence?\n\n## Implication\n\nTen minutes of reading routinely saves hours of re-coding — and it is also where the limitations section of a good report starts.",
    references: [],
    tags: ["method"],
  };

  const existingArticle = await db.researchArticle.findUnique({ where: { slug: articleSeed.slug } });
  if (!existingArticle) {
    await db.researchArticle.create({
      data: {
        title: articleSeed.title,
        slug: articleSeed.slug,
        summary: articleSeed.summary,
        body: articleSeed.body,
        categoryId: articleSeed.categoryId,
        contentType: articleSeed.contentType,
        readingTimeMinutes: 3,
        isFeatured: true,
        status: "published",
        publishedAt: new Date(),
        metaTitle: articleSeed.title,
        metaDescription: articleSeed.summary.slice(0, 155),
        tags: { connectOrCreate: [{ where: { slug: "method" }, create: { name: "Method", slug: "method" } }] },
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
