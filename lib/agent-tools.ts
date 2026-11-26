// Pure tool definitions and runner. No catalogue import, so a client component
// can use it with a catalogue passed in as props without bundling product data.

export type AgentProduct = {
  slug: string;
  name: string;
  descriptor: string;
  url: string;
  priceUsd: { oneTime: number; subscription: number } | null;
  available: boolean;
  summary: string;
};

export const AGENT_TOOLS = [
  {
    name: "list_products",
    description:
      "List every CHIAREL skincare product with its name, what it is for, page URL and current USD price (one-time and 45-day subscription). Products without a published price are marked unavailable.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_product",
    description: "Get one CHIAREL product by its slug or exact name, including a short summary and current USD price.",
    inputSchema: {
      type: "object",
      properties: { product: { type: "string", description: "Product slug (e.g. clarity-essence) or exact name." } },
      required: ["product"],
      additionalProperties: false,
    },
  },
] as const;

/** Runs a tool by name; shared by the WebMCP registration and the MCP endpoint. */
export function runAgentTool(catalog: AgentProduct[], name: string, args: unknown): { ok: true; data: unknown } | { ok: false; error: string } {
  if (name === "list_products") return { ok: true, data: catalog.map(({ summary: _s, ...rest }) => rest) };
  if (name === "get_product") {
    const arg = (args as { product?: unknown } | null)?.product;
    if (typeof arg !== "string" || !arg.trim()) return { ok: false, error: "product (string) is required" };
    const key = arg.trim().toLowerCase();
    const found = catalog.find((p) => p.slug.toLowerCase() === key || p.name.toLowerCase() === key);
    return found ? { ok: true, data: found } : { ok: false, error: `No product matches "${arg}"` };
  }
  return { ok: false, error: `Unknown tool: ${name}` };
}
