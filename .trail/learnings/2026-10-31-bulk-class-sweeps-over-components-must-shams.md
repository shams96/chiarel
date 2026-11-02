---
title: Bulk class sweeps over components/ must exclude Footer.tsx; Jost woff2 stays for the relabel script
author: Shams
date: 2026-10-31
branch: redesign/p2-design-system
cost: { minutes: 24, tokens: 183791 }
id: l-b78aa2ea
scope: repo
status: active
src: agent
touches:
  - app/account/page.tsx
  - app/admin/audit/page.tsx
  - app/admin/disputes/page.tsx
  - app/admin/login/page.tsx
  - "app/admin/orders/[id]/page.tsx"
  - app/admin/page.tsx
  - app/assessment/page.tsx
  - app/build-your-ritual/page.tsx
  - app/checkout/page.tsx
  - app/contact/page.tsx
---

## Decided
- Libre Bodoni is the only site font (redesign Phase 2, 2026-10-31). `app/layout.tsx` no longer loads Jost; `tailwind.config.ts` aliases `sans` to the Bodoni variable, so unclassed text and the Footer inherit Bodoni.

## Tried and ruled out
- A repo-wide `sed` raising `text-[10px]/[11px]` to `text-[12px]` across `app/` and `components/` also edited `components/Footer.tsx`, which the owner declared off-limits (2026-10-16). Reverted with `git checkout -- components/Footer.tsx`.
- Deleting `public/fonts/jost-latin*.woff2`: ruled out because `scripts/relabel-eye-treatment.mjs` draws jar-label glyphs from `jost-latin.woff2`.

## Watch out
- Any bulk edit under `components/` must exclude `Footer.tsx`; check `git diff --stat -- components/Footer.tsx` before committing.
- `tests/tap-targets-global.test.ts` pins the literal `text-[12px]` on HomeProvenance links alongside the 44px contract.
