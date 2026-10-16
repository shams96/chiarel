import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { isStaging } from "@/lib/app-env";

// Private or per-visitor paths. Repeated for each crawler group below because a
// named user-agent group does not inherit the "*" rules.
const PRIVATE_PATHS = ["/checkout", "/cart", "/account", "/admin", "/order", "/api"];

export default function robots(): MetadataRoute.Robots {
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
