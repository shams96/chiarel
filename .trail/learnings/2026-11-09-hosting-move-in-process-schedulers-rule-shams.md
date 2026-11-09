---
title: "Hosting move: in-process schedulers rule out serverless, and the 2026-11-09 503 was a hung process, not the DB path"
author: Shams
date: 2026-11-09
branch: docs/hosting-move-scope
cost: { minutes: 49, tokens: 471486 }
id: l-6be2cdf5
scope: repo
status: active
src: agent
touches:
  - components/shop/FindYourRitual.tsx
  - public/assets/shop/clarity-ritual-model.jpg
  - tests/shop-storefront.test.ts
  - app/shop/page.tsx
  - claudedocs/specs/store-enhancement/SPEC-AND-PLAN.md
  - components/shop/ShopServiceStrip.tsx
  - claudedocs/specs/hosting-move/SPEC-AND-PLAN.md
  - instrumentation.ts
  - public/assets/products/clarity-ritual-group.jpg
  - claudedocs/adr/0001-database-resilience-and-hosting.md
---

## Decided
- Scoped the hosting move in claudedocs/specs/hosting-move/SPEC-AND-PLAN.md. Preferred: a Hostinger Cloud plan (no code change), fallback KVM 2 VPS, serverless only if the schedulers are reworked.
- A whole-app 503 (Hostinger's own page, /api/health also dead) is a different failure from the DB-path outage in runbooks/database-outage.md; first step is restart, then check uptimeSeconds.

## Tried and ruled out
- ADR-0001's Vercel Pro recommendation did not account for instrumentation.ts: dispute monitor, cart prune and order sweep run on setInterval in a long-lived process, so serverless would need cron routes first.
- Reading Hostinger runtime logs: hosting_nodejs_runtime-logs returned HTTP 500 on 2026-11-09, so the cause of that hang is unknown.

## Watch out
- Root cause of the shared-plan hang is inferred (120 process cap), not seen. Read hPanel resource usage before buying a plan.
- Hostinger builds on Node 18; several deps want Node 20/22 (EBADENGINE warnings). Use Node 22 on any new host.
- Git Bash rewrites bare "/" arguments into C:/Program Files/Git/; use full URLs in curl loops.
