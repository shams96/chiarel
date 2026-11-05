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
Watch out: .hero-in animation delays are per nth-child; adding a child to the text block needs a new delay rule (added nth-child(5)). Local production build and LCP cannot run in a worktree without oauth4webapi installed; CI is authoritative, LCP before/after is unmeasured.
