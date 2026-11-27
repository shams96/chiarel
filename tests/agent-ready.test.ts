import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { renderRobotsTxt, CONTENT_SIGNAL } from "@/lib/robots";
import { organizationJsonLd, productListJsonLd } from "@/lib/seo";
import { listAgentProducts, runAgentTool, AGENT_TOOLS } from "@/lib/agent-catalog";
import { POST as mcpPost, GET as mcpGet } from "@/app/api/mcp/route";
import { GET as cardGet } from "@/app/.well-known/mcp/server-card.json/route";
import { products, isPurchasable } from "@/lib/products";

const home = (accept?: string) =>
  new NextRequest("https://chiarel.com/", { headers: accept ? { accept } : {} });

describe("agent-ready: robots Content-Signal", () => {
  it("declares usage signals in every group", () => {
    const txt = renderRobotsTxt();
    expect(CONTENT_SIGNAL).toBe("search=yes, ai-input=yes, ai-train=no");
    const groups = txt.split("\n\n").filter((g) => g.startsWith("User-agent"));
    expect(groups.length).toBeGreaterThan(5);
    for (const g of groups) expect(g).toContain(`Content-Signal: ${CONTENT_SIGNAL}`);
    expect(txt).toContain("Sitemap: https://chiarel.com/sitemap.xml");
  });
});

describe("agent-ready: homepage negotiation and Link header", () => {
  it("advertises llms.txt and the sitemap via Link, and varies on Accept", () => {
    const res = middleware(home("text/html"));
    expect(res.headers.get("link")).toContain('</llms.txt>; rel="alternate"; type="text/markdown"');
    expect(res.headers.get("vary")).toContain("Accept");
  });
  it("rewrites to the Markdown overview only when Markdown is preferred", () => {
    expect(middleware(home("text/markdown")).headers.get("x-middleware-rewrite")).toContain("/api/markdown");
    expect(middleware(home("text/markdown, text/html;q=0.5")).headers.get("x-middleware-rewrite")).toContain("/api/markdown");
    for (const a of [undefined, "*/*", "text/html,application/xhtml+xml", "text/html, text/markdown;q=0.5", "text/markdown;q=0"]) {
      expect(middleware(home(a)).headers.get("x-middleware-rewrite"), String(a)).toBeNull();
    }
  });
  it("leaves other pages alone", () => {
    const res = middleware(new NextRequest("https://chiarel.com/shop", { headers: { accept: "text/markdown" } }));
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
    expect(res.headers.get("link")).toBeNull();
  });
});

describe("agent-ready: schema", () => {
  it("omits phone, address and sameAs until real values exist (never guessed)", () => {
    const o = organizationJsonLd as Record<string, unknown>;
    expect(o.telephone).toBeUndefined();
    expect(o.address).toBeUndefined();
    expect(o.sameAs).toBeUndefined();
  });
  it("marks every priced product up with an Offer carrying price and currency", () => {
    const list = productListJsonLd(products.filter(isPurchasable));
    expect(list.itemListElement.length).toBeGreaterThan(0);
    for (const li of list.itemListElement) {
      expect(li.item.offers.priceCurrency).toBe("USD");
      expect(li.item.offers.price).toBeGreaterThan(0);
    }
  });
});

describe("agent-ready: catalogue tools, MCP endpoint and server card", () => {
  it("tools answer from the live catalogue", () => {
    const all = listAgentProducts();
    expect(all.length).toBe(products.length);
    const essence = runAgentTool("get_product", { product: "clarity-essence" });
    expect(essence.ok).toBe(true);
    expect(runAgentTool("get_product", { product: "nope" }).ok).toBe(false);
    expect(runAgentTool("get_product", {}).ok).toBe(false);
  });
  const rpc = (body: unknown) =>
    mcpPost(new Request("https://chiarel.com/api/mcp", { method: "POST", body: JSON.stringify(body) }));
  it("speaks MCP: initialize, tools/list, tools/call, notifications", async () => {
    const init = await (await rpc({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} })).json();
    expect(init.result.capabilities.tools).toBeDefined();
    const list = await (await rpc({ jsonrpc: "2.0", id: 2, method: "tools/list" })).json();
    expect(list.result.tools.map((t: { name: string }) => t.name)).toEqual(AGENT_TOOLS.map((t) => t.name));
    const call = await (await rpc({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "list_products", arguments: {} } })).json();
    expect(JSON.parse(call.result.content[0].text).length).toBe(products.length);
    const bad = await (await rpc({ jsonrpc: "2.0", id: 4, method: "nope" })).json();
    expect(bad.error.code).toBe(-32601);
    expect((await rpc({ jsonrpc: "2.0", method: "notifications/initialized" })).status).toBe(202);
    expect(mcpGet().status).toBe(405);
  });
  it("publishes a server card pointing at the real endpoint", async () => {
    const card = await cardGet().json();
    expect(card.name).toBeTruthy();
    expect(card.version).toBeTruthy();
    expect(card.remotes[0].url).toBe("https://chiarel.com/api/mcp");
    expect(card.capabilities.tools).toBeDefined();
  });
});
