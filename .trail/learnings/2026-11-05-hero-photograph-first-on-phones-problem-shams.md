---
title: "Hero: photograph first on phones, problem line under the mission h1"
author: Shams
date: 2026-11-05
branch: feat/hero-image-first
cost: { minutes: 13, tokens: 264476 }
id: l-f68345a9
scope: repo
status: active
src: agent
touches:
  - components/home/HomeHero.tsx
  - app/globals.css
  - tests/focus-ladder-direction.test.tsx
  - app/house/page.tsx
  - app/science/barrier-resilience/page.tsx
  - app/science/page.tsx
  - app/page.tsx
  - components/home/HomeIntro.tsx
---

Decided (components/home/HomeHero.tsx, tests/focus-ladder-direction.test.tsx, app/globals.css): the homepage hero shows the photograph first below lg (order-first, 5:4 frame) and adds one problem line under the mission h1: "For skin under the daily load of screens, dry indoor air and too little sleep." Wording is verbatim from app/house/page.tsx and app/science/barrier-resilience/page.tsx; claim-audit passed. Mission line stays the h1 (Decision 037).
Trade-off measured at 390x844: photograph top moved from y=934 (below the fold) to y=201-479; the Begin the Ritual button moved from y=473 to y=975 (one scroll). The poster headline alone is ~257px, so photo, headline and button cannot all fit above the fold without shrinking the poster.
Ruled out: a new fade-in on the hero image (it is the LCP element; HomeHero already has the hero-in entrance and a photo entrance in globals.css). Ruled out: removing the formulation paragraph (it exists only in HomeHero, so removing it would lose ratified copy); it stays below the price line.
Watch out: .hero-in animation delays are per nth-child; adding a child to the text block needs a new delay rule (added nth-child(5)).
Verified (claudedocs/specs/luxury-experience/W1-VERIFICATION.md): production builds of main and this branch, Lighthouse mobile x3 each: median LCP 4741 ms -> 3995 ms, LCP element changes from the hero paragraph to the photograph, CLS 0, a11y 100; axe 0 violations; ui-ux-pro-max audit no fixes needed; 685 tests pass.
Watch out (local setup): a worktree has no node_modules of its own and the shared one lacks oauth4webapi. Fix: `npm pack oauth4webapi@<lockfile version>`, check the sha512 against package-lock.json, copy the package folder into <worktree>/node_modules/oauth4webapi (gitignored; never touch the shared node_modules). With two lockfiles Next nests the standalone server at .next/standalone/.claude/worktrees/<name>/server.js and the postbuild script copies static and public to .next/standalone/ instead, so copy .next/static and public into the nested folder before running it. Next only serves public files present at server start. Deleting those nested build folders on Windows needs the \\?\ long-path prefix.
