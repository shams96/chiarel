---
title: Home closing tiles are an equal pair; staging.chiarel.com does not exist
author: Shams
date: 2026-11-02
branch: fix/closing-pair-tiles
cost: { minutes: 28, tokens: 190613 }
id: l-35a7fddd
scope: repo
status: active
src: agent
touches:
  - components/home/HomeClosing.tsx
  - components/home/HomeFaceBeyond.tsx
---

## Decided
- HomeClosing Essence and Day Crème tiles: equal width, same top and bottom. The old 3:2 split with self-end made the Day tile hang lower and narrower with no rationale.
- Social sign-in is admin-only, Google only, no auto-link (spec in claudedocs/specs/social-signin/); PR #140 stays unmerged until tested.

## Tried and ruled out
- A Google Group as the OAuth support email: only gives an @googlegroups.com address; left the default Gmail.

## Watch out
- staging.chiarel.com gave no response (2026-11-02), but the sign-in rollout plan assumes it. Test locally with the localhost redirect URI first.
- Hero headline already has 0.84 alpha, so the softer ink makes it a little lighter.
