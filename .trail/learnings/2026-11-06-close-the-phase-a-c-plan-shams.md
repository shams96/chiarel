---
title: "Close the Phase A-C plan gaps: CTA vocabulary, summary-first bag, order sweep"
author: Shams
date: 2026-11-06
branch: fix/close-plan-gaps
cost: { minutes: 17, tokens: 153586 }
id: l-6dfcd9fb
scope: repo
status: active
src: agent
touches:
  - claudedocs/specs/luxury-experience/SPEC.md
  - claudedocs/specs/luxury-experience/PLAN.md
  - components/home/HomeHero.tsx
  - app/globals.css
  - tests/focus-ladder-direction.test.tsx
  - claudedocs/specs/luxury-experience/W1-VERIFICATION.md
  - lib/plan-labels.ts
  - components/PurchaseOptions.tsx
  - components/StickyPurchaseBar.tsx
  - components/CartDrawer.tsx
---

Decided (lib/plan-labels.ts, claudedocs/commerce/PLAN_STATUS.md): the buying funnel's wording is one table, `CTA` (Begin the Ritual / Add to Bag for one-time, Checkout, Complete Your Order) plus `addCtaLabel(tier)` shared by the product page and the sticky bar. The plan's Phase B CTA bullet had shipped unimplemented and unrecorded; PLAN_STATUS.md now lists every Phase A-C bullet with its evidence so an omission cannot be silent.
Decided: abandoned pending orders are marked `expired` (lib/order-sweep.ts, hourly), never deleted; a late paid event can still revive them because `expired` is in PAYABLE_FROM. lib/order-total.ts is the one place a tax-inclusive total is formatted (order page, email, account, admin).
Ruled out: a live-site check that greps for "Complete Your Order" in HTML is wrong twice over: it is case-sensitive (the old heading was "Complete your order") and cart/checkout copy renders client-side. Check the deployed JS chunks or the source on main instead.
Watch out: a worktree with its own node_modules nested in the main checkout makes `next lint` fail ("Plugin @next/next was conflicted"); lint with `npx eslint --no-eslintrc -c .eslintrc.json --ext .ts,.tsx <dirs>`. The auto-mode classifier denies ad-hoc scripts that read production data unless the owner just authorised that exact read.
