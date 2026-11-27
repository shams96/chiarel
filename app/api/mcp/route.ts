import { AGENT_TOOLS, runAgentTool } from "@/lib/agent-catalog";
import { SITE_NAME } from "@/lib/seo";

// Minimal read-only MCP server (Streamable HTTP, stateless JSON responses).
// It exposes the public catalogue only: no cart, no accounts, no writes.
export const dynamic = "force-dynamic";

const PROTOCOL_VERSION = "2025-06-18";

type Rpc = { jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string, unknown> };

const ok = (id: Rpc["id"], result: unknown) => ({ jsonrpc: "2.0", id: id ?? null, result });
const err = (id: Rpc["id"], code: number, message: string) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });

function handle(msg: Rpc) {
  const { id, method, params } = msg;
  if (typeof method !== "string") return err(id, -32600, "Invalid request");
  // Notifications carry no id and get no response body.
  if (id === undefined) return null;
  switch (method) {
    case "initialize":
      return ok(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "chiarel-catalogue", title: `${SITE_NAME} catalogue`, version: "1.0.0" },
        instructions: "Read-only access to the CHIAREL product catalogue and current USD prices.",
      });
    case "ping":
      return ok(id, {});
    case "tools/list":
      return ok(id, { tools: AGENT_TOOLS });
    case "tools/call": {
      const name = typeof params?.name === "string" ? params.name : "";
      const out = runAgentTool(name, params?.arguments);
      if (!out.ok && out.error.startsWith("Unknown tool")) return err(id, -32602, out.error);
      return ok(id, {
        content: [{ type: "text", text: out.ok ? JSON.stringify(out.data) : out.error }],
        ...(out.ok ? {} : { isError: true }),
      });
    }
    default:
      return err(id, -32601, `Method not found: ${method}`);
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(err(null, -32700, "Parse error"), { status: 400 });
  }
  const batch = Array.isArray(body);
  const replies = (batch ? (body as Rpc[]) : [body as Rpc]).map((m) => handle(m ?? {})).filter((r) => r !== null);
  if (replies.length === 0) return new Response(null, { status: 202 });
  return Response.json(batch ? replies : replies[0]);
}

// No server-initiated stream: tell clients that GET is unsupported, per the transport spec.
export function GET() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}
