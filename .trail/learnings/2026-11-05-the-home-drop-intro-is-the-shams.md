---
title: "The home drop intro is the owner's signature moment: never change its timing as a batched decision"
author: Shams
date: 2026-11-05
branch: fix/restore-intro-timing
id: l-4318b682
scope: repo
status: active
src: agent
touches:
  - components/HeroIntro.tsx
---

## Decided
- HeroIntro (components/HeroIntro.tsx) is restored to the original ~7.3 s timing (hold 6.8 s + exit 0.5 s, impact 2.3 s, wave 4.2 s). The Phase 6 cut to 1.5 s (commit 4db4081, decision D10) is reversed; replay flag is v10.
- Any change to the intro's look or timing gets its own explicit question to the owner, never a row in a multi-item decisions table.

## Tried and ruled out
- Reading D10 ("owner accepted D1-D15 YES") as authorisation: the owner says they did not authorise the cut. The decisions file is written by the session, so it is not independent proof of what was approved.
- Hunting for a countdown or launch timer: none exists in app/, components/ or lib/; "drop" means this intro animation.

## Watch out
- Bump SESSION_FLAG whenever the intro changes, or returning visitors never see it.
- Production migrations are manual (no migrate deploy in the build), and Hostinger can keep serving the old Node process after a deploy; check /api/health uptimeSeconds before trusting a new route.
