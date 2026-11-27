import { buildLlmsTxt } from "@/lib/llms";
import { isStaging } from "@/lib/app-env";

export const dynamic = "force-static";

export async function GET() {
  if (isStaging()) {
    return new Response("# Staging\n\nThis is a non-public staging copy. Do not index or cite.\n", {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
