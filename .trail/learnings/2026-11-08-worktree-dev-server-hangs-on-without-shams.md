---
title: Worktree dev server hangs on / without .env.local; copy the gitignored file from the main checkout
author: Shams
date: 2026-11-08
branch: feat/shop-storefront-shell
cost: { minutes: 25, tokens: 104574 }
id: l-a2791e88
scope: repo
status: active
src: agent
touches:
  - claudedocs/specs/store-enhancement/SPEC-AND-PLAN.md
  - components/shop/FindYourRitual.tsx
  - components/shop/ShopServiceStrip.tsx
  - app/shop/page.tsx
  - tests/shop-storefront.test.ts
  - "app/shop/[slug]/page.tsx"
  - app/build-your-ritual/page.tsx
  - app/assessment/page.tsx
  - app/cart/page.tsx
  - components/layout/Heading.tsx
---

## Decided
A fresh worktree has no .env.local, so next dev compiles / and stalls on 'Environment variable not found: DATABASE_URL' (scheduler errors in preview_logs), and browser navigate/javascript calls time out. Copy .env.local from the main checkout (gitignored, confirm with git check-ignore) and restart preview; /shop then rendered in about 2 minutes on first compile.

## Tried and ruled out
Retrying navigate or waiting longer: the page never rendered until the env file existed.

## Watch out
Never print or commit the file. tests/customer-accounts and tests/social-auth fail locally only (oauth4webapi missing from the worktree node_modules); CI passes them.
