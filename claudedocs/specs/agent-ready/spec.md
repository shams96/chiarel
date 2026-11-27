# Agent-ready site (2026-11-26)

Scanner list of 8 items. Compressed spec/plan/tasks (owner supplied the what).

| # | Item | Done | Notes |
|---|------|------|-------|
| 1 | Content Signals | yes | `lib/robots.ts`, served by `app/robots.txt/route.ts`. `search=yes, ai-input=yes, ai-train=no` in every group. Owner decision to confirm: ai-train=no. |
| 2 | Org schema phone/address | plumbing only | `BUSINESS_PHONE`, `BUSINESS_ADDRESS` in `lib/seo.ts`, emitted only when set. No phone or address exists in the repo; not guessed. |
| 3 | sameAs | plumbing only | `SAME_AS` in `lib/seo.ts`, empty. No social/directory profile URLs exist in the repo; not guessed. |
| 4 | Prices without JS | yes | `productListJsonLd` (Product + Offer, USD) on the homepage, beside the existing OfferCatalog. |
| 5 | Markdown on request | yes | middleware rewrites `/` to `/api/markdown` when `text/markdown` is preferred. Dynamic + `no-store` so a cached copy can never reach a browser. |
| 6 | Link header | yes | `/` sends `Link: </llms.txt>; rel=alternate; type=text/markdown, </sitemap.xml>; rel=sitemap`. |
| 7 | WebMCP | yes | `components/WebMcpTools.tsx`, read-only `list_products` / `get_product`. |
| 8 | MCP server card | yes | `/.well-known/mcp/server-card.json` -> real read-only MCP endpoint `/api/mcp` (stateless JSON-RPC). |

Known limit: Next overrides `Vary` on the cached homepage, so a CDN that ignores `Accept` may serve HTML to agents. Safe direction (markdown is never cached). Verify live after deploy.
