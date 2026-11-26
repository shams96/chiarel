import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { AGENT_TOOLS } from "@/lib/agent-catalog";

export const dynamic = "force-static";

// MCP Server Card (SEP-1649): describes the read-only catalogue server at /api/mcp.
export function GET() {
  return Response.json(
    {
      $schema: "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
      name: "com.chiarel/catalogue",
      title: `${SITE_NAME} catalogue`,
      description: "Read-only access to the CHIAREL skincare product catalogue and current USD prices.",
      version: "1.0.0",
      websiteUrl: SITE_URL,
      remotes: [{ type: "streamable-http", url: `${SITE_URL}/api/mcp` }],
      capabilities: { tools: { listChanged: false } },
      tools: AGENT_TOOLS.map((t) => ({ name: t.name, description: t.description })),
      authentication: { required: false },
    },
    { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=3600" } }
  );
}
