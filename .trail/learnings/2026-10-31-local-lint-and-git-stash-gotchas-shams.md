---
title: Local lint and git stash gotchas in the nested worktree
author: Shams
date: 2026-10-31
branch: redesign/p5-pages
cost: { minutes: 1, tokens: 1113 }
id: l-e1e7cd96
scope: repo
status: active
src: agent
touches:
  - app/founding-100/page.tsx
  - app/press/page.tsx
---

## Decided
In `app/founding-100/page.tsx` and `app/press/page.tsx` work: wide pages use max-w-container; reading pages keep a 3xl/4xl column on px-margin. The Press logo swatch in `app/press/page.tsx` stays on bg-ocean because the Peach Dust wordmark is invisible on light.

## Tried and ruled out
`npm run lint` in this nested worktree exits 1: a parent-folder `.eslintrc.json` loads a second @next/next plugin. Use `npx eslint --no-eslintrc -c .eslintrc.json app components --ext .ts,.tsx`; it passes.

## Watch out
Never run `git stash push -u` as a "check": it stashed all uncommitted work (restored via apply + drop). `app/founding-100/page.tsx` returns 500 locally without Postgres, so it can't be visually checked; CI smoke covers it.
