import type { SiteSettings } from "@prisma/client";

/**
 * Centralised structured-data (JSON-LD) builders.
 *
 * SEO  — classic search: WebSite, Person, breadcrumbs, article metadata.
 * AEO  — answer engines: FAQPage with explicit question/answer pairs.
 * GEO  — generative engines: clean declarative facts (knowsAbout, sameAs,
 *        descriptions) that make the Person entity easy to cite correctly.
 */

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function displayName(settings?: SiteSettings | null): string {
  return settings?.displayName || "Refilwe Molapisi";
}

export function headline(settings?: SiteSettings | null): string {
  return settings?.headline || "Final-year BCom Economics student";
}

/** Stable @id for the Person node so every schema can reference the same entity. */
export function personId(settings?: SiteSettings | null): string {
  return `${siteUrl()}/#person`;
}

export function buildPersonSchema(settings?: SiteSettings | null) {
  const name = displayName(settings);
  const base = siteUrl();
  const sameAs = settings?.linkedinUrl ? [settings.linkedinUrl] : [];
  const knowsAbout = (settings?.professionalInterests || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    "@type": "Person",
    "@id": personId(settings),
    name,
    url: base,
    jobTitle: headline(settings),
    description:
      settings?.intro ||
      `${name} is a final-year BCom Economics student publishing analytical projects, research and skills in business intelligence, commercial analysis and economic research.`,
    nationality: "South African",
    inLanguage: "en-ZA",
    knowsAbout: knowsAbout.length
      ? knowsAbout
      : [
          "Business intelligence",
          "Commercial and business analysis",
          "Market research and consumer insights",
          "Economic and policy research",
        ],
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function buildWebSiteSchema(settings?: SiteSettings | null) {
  const base = siteUrl();
  const name = displayName(settings);
  return {
    "@type": "WebSite",
    "@id": `${base}/#website`,
    url: base,
    name: settings?.defaultMetaTitle || `${name} — Analytics Portfolio`,
    description:
      settings?.defaultMetaDescription ||
      `Portfolio of ${name}, final-year BCom Economics student: projects, research and skills in business intelligence, commercial analysis and economic research.`,
    inLanguage: "en-ZA",
    publisher: { "@id": personId(settings) },
    author: { "@id": personId(settings) },
  };
}

/** Breadcrumb trail: Home → section → (optional) item. */
export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const base = siteUrl();
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${base}${item.url}`,
    })),
  };
}

export const FAQ_QUESTIONS = [
  {
    question: "Who is Refilwe Molapisi?",
    answer:
      "Refilwe Molapisi is a final-year Bachelor of Commerce (BCom) Economics student from South Africa. This site is her professional analytics portfolio, where she publishes end-to-end analytical projects, research notes and an honest skills inventory as she prepares for entry-level analyst roles from 2027.",
  },
  {
    question: "What kind of analytical work is on this site?",
    answer:
      "Three kinds of work: business intelligence (dashboards and reporting), commercial and market analysis (framing commercial questions, consumer and market studies), and economic analysis and research (statistics and econometrics applied to economic questions). Every project documents its research question, data, method, findings and limitations.",
  },
  {
    question: "Which tools and technologies does Refilwe use?",
    answer:
      "Microsoft Excel, Power BI (DAX measures and data modelling), SQL (joins, aggregations and window functions), and Python with pandas and matplotlib for data wrangling and exploratory analysis, alongside descriptive and inferential statistics from econometrics coursework.",
  },
  {
    question: "Is the data in the projects real?",
    answer:
      "Projects are clearly labelled. Work marked as simulated or synthetic uses data generated for demonstration purposes and describes no real organisation; where real published datasets are used, the source and licence are cited on the project page. Findings are always reported with their limitations.",
  },
  {
    question: "What roles is Refilwe looking for?",
    answer:
      "Entry-level opportunities from 2027 in business intelligence, commercial and business analysis, market research and consumer insights, risk and compliance, and economic or policy research.",
  },
  {
    question: "How can I contact Refilwe Molapisi?",
    answer:
      "The best way to make contact is LinkedIn via the link in the site navigation and the About page, or by email where a public address is shown. This site intentionally has no comment forms and collects no visitor personal information.",
  },
];

export function buildFaqSchema() {
  return {
    "@type": "FAQPage",
    "@id": `${siteUrl()}/about#faq`,
    mainEntity: FAQ_QUESTIONS.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
}

export function buildProfilePageSchema(settings?: SiteSettings | null) {
  return {
    "@type": "ProfilePage",
    "@id": `${siteUrl()}/#profilepage`,
    url: `${siteUrl()}/`,
    name: `${displayName(settings)} — Analytics Portfolio`,
    inLanguage: "en-ZA",
    mainEntity: { "@id": personId(settings) },
  };
}

export function buildItemListSchema(name: string, url: string, items: Array<{ name: string; url: string }>) {
  return {
    "@type": "ItemList",
    name,
    url: `${siteUrl()}${url}`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: `${siteUrl()}${item.url}`,
    })),
  };
}

/** Serialize as JSON with a safe escaping for </script>. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString(data) }}
    />
  );
}
