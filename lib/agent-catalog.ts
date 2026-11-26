import { products, isPurchasable, productHref } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";
import { runAgentTool as run, type AgentProduct } from "@/lib/agent-tools";

export { AGENT_TOOLS, type AgentProduct } from "@/lib/agent-tools";

// One read-only view of the catalogue for software agents. The WebMCP tools on
// the page and the MCP endpoint both answer from here, so they cannot disagree
// with the site or with each other. Prices come from the same data the pages use.
export function listAgentProducts(): AgentProduct[] {
  return products.map((p) => {
    const buyable = isPurchasable(p);
    return {
      slug: productHref(p.slug).split("/").pop() as string,
      name: p.name,
      descriptor: p.descriptor,
      url: `${SITE_URL}${productHref(p.slug)}`,
      priceUsd: buyable ? { oneTime: p.price.oneTime, subscription: p.price.subscription } : null,
      available: buyable,
      summary: p.blurb,
    };
  });
}

export const runAgentTool = (name: string, args: unknown) => run(listAgentProducts(), name, args);
