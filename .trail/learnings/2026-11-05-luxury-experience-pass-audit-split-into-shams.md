---
title: "Luxury experience pass: audit split into four workstreams, held at spec"
author: Shams
date: 2026-11-05
branch: feat/luxury-experience
cost: { minutes: 1, tokens: 1129 }
id: l-7c1d91db
scope: repo
status: active
src: agent
touches:
  - components/home/HomeHero.tsx
  - app/assessment/page.tsx
  - components/home/HomeObservations.tsx
---

Decided (claudedocs/specs/luxury-experience/SPEC.md, components/home/HomeHero.tsx, app/assessment/page.tsx, components/home/HomeObservations.tsx): the third-party luxury audit is split into four workstreams (hero and sensory, story depth, guided path, real luxury cues) and held at a spec, with six owner decisions D1-D6 before any plan or code.
Ruled out: the audit's product-naming row. Live /shop and /ritual use only the five Clarity names; old names remain only in comments, internal docs and unserved source files.
Ruled out: "no assessment flow". /assessment already exists (8 questions, four axes). The gap is visibility and depth, not absence.
Watch out: this session is isolated to one worktree; writing into a second worktree needs EnterWorktree with path. A relative `git worktree add` from inside a worktree nests the new one inside it; use an absolute sibling path.
Decided: owner answered D1-D6 (hero, guided path, story, cues; keep clinical section visible, softened; no limited editions; unboxing blocked on real assets; keep "From $X a day"; real photography only). Emotional reframe (problem first) adopted as the filter; app/science/page.tsx already writes it that way.
Watch out: components/home/HomeHero.tsx h1 "Advancing Cellular Clarity™" is ratified (Decision 037); moving it behind a problem line is an owner call, not an implied one. "Neck ages faster than the face" is an unsubstantiated comparative claim; do not put it in copy.
Watch out: unboxing, limited editions and VIP need real assets or real business facts; no invented scarcity, reviews or label text.
