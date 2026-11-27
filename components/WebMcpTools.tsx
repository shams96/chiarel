"use client";

import { useEffect } from "react";
import { AGENT_TOOLS, runAgentTool, type AgentProduct } from "@/lib/agent-tools";

// WebMCP: exposes the read-only catalogue tools to in-browser agents through
// navigator.modelContext. Does nothing in browsers without it. The tools only
// read public catalogue data already on the page; they never touch the cart.
type ModelContext = {
  registerTool?: (tool: {
    name: string;
    description: string;
    inputSchema: unknown;
    annotations?: { readOnlyHint?: boolean };
    execute: (args: unknown) => Promise<{ content: { type: "text"; text: string }[] }>;
  }) => unknown;
};

export default function WebMcpTools({ catalog }: { catalog: AgentProduct[] }) {
  useEffect(() => {
    const mc = (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
    if (!mc?.registerTool) return;
    for (const t of AGENT_TOOLS) {
      try {
        mc.registerTool({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
          annotations: { readOnlyHint: true },
          execute: async (args) => {
            const out = runAgentTool(catalog, t.name, args);
            return { content: [{ type: "text", text: out.ok ? JSON.stringify(out.data) : out.error }] };
          },
        });
      } catch {
        // Already registered (fast refresh, remount): nothing to do.
      }
    }
  }, [catalog]);
  return null;
}
