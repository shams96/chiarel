import { buildLlmsTxt } from "@/lib/llms";
import { isStaging } from "@/lib/app-env";

// Markdown representation of the homepage, reached only by middleware when a
// client asks for text/markdown. Dynamic and uncacheable on purpose: the
// homepage URL is cached as HTML, and a cached Markdown copy must never be
// served to a browser from that same URL.
export const dynamic = "force-dynamic";

export function GET() {
  const body = isStaging() ? "# Staging\n\nNon-public staging copy. Do not index or cite.\n" : buildLlmsTxt();
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "private, no-store",
      Vary: "Accept",
    },
  });
}
