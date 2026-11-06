---
title: "Worktree node_modules junction must be made with PowerShell New-Item, not bash mklink"
author: Shams
date: 2026-10-27
branch: feat/home-hero-one-frame
cost: { minutes: 21, tokens: 199680 }
id: l-032966e2
scope: repo
status: active
src: agent
touches:
  - components/RoutineBand.tsx
---

## Decided
In a git worktree off origin/main, link node_modules with PowerShell `New-Item -ItemType Junction -Path <wt>\node_modules -Target <main>\node_modules`.

## Tried and ruled out
`cmd //c mklink /J` from the Bash tool produced a junction targeting `C:\C:\Users\...`, so `npx tsc` printed "This is not the tsc command you are looking for" and vitest failed with "Cannot find module 'vitest/config'". The tsc "failure" before the components/RoutineBand.tsx edit passed was this broken link, not a type error in that file.

## Watch out
If tsc or vitest can't find typescript/vitest in a worktree, check `(Get-Item node_modules).Target` before suspecting the code.
