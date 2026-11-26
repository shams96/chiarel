import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { isStaging } from "@/lib/app-env";

// Private or per-visitor paths. Repeated for each crawler group below because a
// named user-agent group does not inherit the "*" rules.
const PRIVATE_PATHS = ["/checkout", "/cart", "/account", "/admin", "/order", "/api"];

export function robots(): MetadataRoute.Robots {
  if (isStaging()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      // Explicit allow for known AI/answer-engine crawlers (GEO) — nothing
      // on this site depends on gating them; visibility in AI answers is
      // the goal, not the risk.
      { userAgent: "GPTBot", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "PerplexityBot", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "ClaudeBot", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "Google-Extended", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "ChatGPT-User", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "Claude-SearchBot", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "Claude-User", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "Applebot-Extended", allow: "/", disallow: PRIVATE_PATHS },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

// Content Signals (contentsignals.org): how the content may be used once fetched.
// Search and answer-engine use is welcome (visibility in AI answers is the goal);
// training models on it is not granted.
export const CONTENT_SIGNAL = "search=yes, ai-input=yes, ai-train=no";

type Rule = { userAgent: string | string[]; allow?: string | string[]; disallow?: string | string[] };

/** Renders the robots rules as robots.txt text, with the Content-Signal line in every group. */
export function renderRobotsTxt(): string {
  const m = robots();
  const rules = (Array.isArray(m.rules) ? m.rules : [m.rules]) as Rule[];
  const list = (v?: string | string[]) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
  const groups = rules.map((r) =>
    [
      ...list(r.userAgent).map((u) => `User-agent: ${u}`),
      ...(isStaging() ? [] : [`Content-Signal: ${CONTENT_SIGNAL}`]),
      ...list(r.allow).map((p) => `Allow: ${p}`),
      ...list(r.disallow).map((p) => `Disallow: ${p}`),
    ].join("\n")
  );
  const sitemap = m.sitemap ? `\n\nSitemap: ${m.sitemap}` : "";
  return groups.join("\n\n") + sitemap + "\n";
}
