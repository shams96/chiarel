# CHIAREL Handoff (2026-10-14)

Read memory first (`MEMORY.md` index loads automatically). This file is the state snapshot.

## Current state
- `main` = `15c193e` (Revert of Tailwind 4, PR #16). Tailwind 3 is live. Site healthy: `/api/products` and `/api/cart` return 200 (~0.7s warm, ~9.5s cold start).
- Stack live: Next 15.5.27, Vitest 5, Prisma 6.12, Supabase Postgres, Stripe TEST mode, Hostinger git auto-deploy from `main`.
- CI `check` (required): tsc, lint, 124 vitest tests, build, Postgres 15 + migrate + seed + standalone server + `scripts/smoke.mjs` (8 checks).
- Staging code merged (`APP_ENV=staging`, `claudedocs/foundation/STAGING.md`). The staging environment itself is not created (owner-side: second Hostinger Node app, separate Supabase, separate Stripe test webhook).

## Tailwind 4: parked, not abandoned
- Work is in git history: squash commit `8c5b94d` (PR #15), reverted by `15c193e`. Local visual parity was proven (48/58 pages identical + noise, 16/16 states identical).
- Production broke after merge: DB routes 503 and the deploy never went live. Cause unconfirmed. Leading suspect: Hostinger Node < 20 (Tailwind 4 oxide needs Node >= 20).
- To re-land:
  1. Owner provides from hPanel: Node version for the app, status of the 18:24 deploy (Completed/Failed), and the last build-log lines if failed.
  2. Set Node 20 or 22 in hPanel if needed.
  3. `curl -4 https://chiarel.com/api/products` immediately before merging.
  4. Revert the revert via a new PR (`git revert 15c193e`), merge only on explicit go.
  5. Verify with short single checks. If it breaks, revert at once, no long watch loops.
- Gotchas and the visual-diff harness are in memory `chiarel-tailwind4-migration.md`.

## Working rules (from memory)
- PR per change; merge only on explicit "merge it"; mutation-check new tests; say READY when done.
- Reverts are immediate. Verify with short single checks, never long blocking polls.
- Curl live before merging any deploy-risking PR.
- Git Bash: set `MSYS_NO_PATHCONV=1` for docker/curl/node args starting with `/`.
- Use apex `curl -4 https://chiarel.com` (www has a bot challenge). Hostinger HTML is cached `s-maxage=3600`; confirm deploys in hPanel.

## Open items
1. **Product photos (not mine, uncommitted):** `public/assets/products/recovery-masque-jar.png` deleted in the working tree, untracked `recovery-masque-jar.jpg`, `chiarel-essence-jar1.png`, N1 neck PNG/MP4, `Copilot_*.png`; `terra-radiance-creme-jar.png` modified. Code still references the `.png` (`data/products.json:203,205`, `components/Footer.tsx:56`). Owner must decide before any commit, or the site breaks. Packshots must be transparent 1400x1400 PNGs (see `chiarel-image-standard.md`).
2. **Site overhaul:** owner has not answered: what is driving it, off-limits brand rules, launch date. Proposed phases: 0 finish open items and staging; 1 mobile purchase path and conversion (emails, trust, analytics/monitoring); 2 brand/design polish; 3 speed/SEO/AEO; 4 launch readiness.
3. **Staging environment setup** (owner-side, per STAGING.md).
4. **Dependencies:** eslint-config-next chain and PostCSS 8.4.31 inside Next (npm audit 11 on current main).
5. **Launch blockers:** Stripe live keys, Stripe Tax head-office address, EU Responsible Person (Natural You Srl), a real test-card checkout on the live site, production admin bootstrap (needs explicit go-ahead).
6. **User-side cleanup:** MCP/plugin cleanup, jcode SessionStart hook decision.

## First message for the new session
> Continue CHIAREL. Read memory and `claudedocs/HANDOFF.md`. Next: re-land Tailwind 4 once I give you the Hostinger Node version and deploy status.
