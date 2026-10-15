import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { isStaging } from "@/lib/app-env";

export default function robots(): MetadataRoute.Robots {
  if (isStaging()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/checkout", "/account"] },
      // Explicit allow for known AI/answer-engine crawlers (GEO) — nothing
      // on this site depends on gating them; visibility in AI answers is
      // the goal, not the risk.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "Claude-SearchBot", allow: "/" },
      { userAgent: "Claude-User", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
