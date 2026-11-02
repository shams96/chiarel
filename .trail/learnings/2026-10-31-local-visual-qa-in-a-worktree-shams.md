---
title: "Local visual QA in a worktree: use next start with CI placeholder env and wait out HeroIntro"
author: Shams
date: 2026-10-31
branch: redesign/p3-homepage
cost: { minutes: 4, tokens: 37770 }
id: l-097b7599
scope: repo
status: active
src: agent
touches:
  - app/page.tsx
  - components/home/HomeFormulator.tsx
  - components/home/HomeItaly.tsx
  - tests/tap-targets-global.test.ts
  - claudedocs/specs/swiss-luxury-redesign/AUDIT.md
  - claudedocs/specs/swiss-luxury-redesign/PLAN.md
  - claudedocs/specs/swiss-luxury-redesign/TASKS.md
  - claudedocs/specs/swiss-luxury-redesign/SPEC.md
  - app/layout.tsx
---

## Decided
- Home sections 08/09 split out of HomeProvenance into `components/home/HomeItaly.tsx` and `HomeFormulator.tsx`: light, on the 12/8/4 grid, existing approved copy unchanged, caption states the image is a brand scene.

## Tried and ruled out
- `.next/standalone/server.js` from a worktree: the worktree sits inside the main repo, so Next nests the standalone output under `.next/standalone/.claude/worktrees/<name>/` and the postbuild asset copy misses it. Use `npx next start -p 3100` after `npm run build` instead.
- Local DB smoke test: Docker was not running, so `scripts/smoke.mjs` cannot be run here; CI runs it.

## Watch out
- Build needs the CI placeholder env (DATABASE_URL, DIRECT_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, ADMIN_SESSION_SECRET from `.github/workflows/ci.yml`) or it fails on "STRIPE_SECRET_KEY is not set".
- HeroIntro covers the whole home page for ~6.8 s on the first load of each session and locks scroll; screenshots or `getElementById(...).scrollIntoView()` before it ends show a blank overlay. Wait ~9 s after navigation. `Reveal` also fades content in, so wait 2-3 s after scrolling before judging.
