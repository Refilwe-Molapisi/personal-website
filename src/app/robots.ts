import type { MetadataRoute } from "next";

/**
 * robots.txt — deliberately crawlable by both traditional search engines and
 * AI answer/generative engines (AEO/GEO): the site is a public professional
 * portfolio, so being summarised and cited by AI systems is desired.
 *
 * Private surfaces (/admin, /api) stay blocked for every agent.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // AI crawlers explicitly welcomed. (Some engines gate on robots.txt by
  // default — an explicit allow removes any ambiguity.)
  const aiCrawlers = [
    "GPTBot",               // OpenAI training
    "OAI-SearchBot",        // OpenAI search
    "ChatGPT-User",         // OpenAI user-initiated browsing
    "ClaudeBot",            // Anthropic training/retrieval
    "Claude-User",          // Anthropic user-initiated
    "Claude-SearchBot",     // Anthropic search
    "PerplexityBot",        // Perplexity indexing
    "Perplexity-User",      // Perplexity user-initiated
    "Google-Extended",      // Gemini / AI training
    "Applebot-Extended",    // Apple Intelligence
    "CCBot",                // Common Crawl
    "Amazonbot",            // Alexa / training
    "meta-externalagent",   // Meta AI
    "Bytespider",           // ByteDance AI
    "DuckAssistBot",        // DuckDuckGo AI
    "YouBot",               // You.com
    "cohere-ai",            // Cohere
  ];

  const disallowPrivate = ["/admin", "/admin/", "/api/"];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: disallowPrivate },
      ...aiCrawlers.map((userAgent) => ({ userAgent, allow: "/", disallow: disallowPrivate })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
