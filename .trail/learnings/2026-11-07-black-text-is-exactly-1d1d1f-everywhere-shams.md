---
title: "Black text is exactly #1d1d1f everywhere: hero poster was rgb(50 49 45 / .84), admin used text-ink/70-80"
author: Shams
date: 2026-11-07
branch: fix/true-black-text
cost: { minutes: 3, tokens: 37787 }
id: l-7a90059d
scope: repo
status: active
src: agent
touches:
  - app/globals.css
  - tests/text-colour-standard.test.ts
---

## Decided
- Every black text uses the logo ink #1d1d1f at full opacity. The hero poster ("Advancing Cellular Clarity") and the ladder/outline type in app/globals.css used rgb(50 49 45) (and the poster 0.84 alpha), which read as washed-out grey-black; now rgb(29 29 31) / #1d1d1f. Admin console and global-error text moved from text-ink/70|80 to text-ink.
- Only the black changed. Hairline borders (rgb(50 49 45 / .15-.45)), ochre, garden, cloud/ivory text were left alone on purpose (owner: "you will not touch other colors just the black").

## Tried and ruled out
- Fixing only text-ink/NN classes: the faded poster colour lived in globals.css (.poster > span), invisible to a class grep. Measure computed colour of every text node in the browser and grep CSS for the raw rgb as well.

## Watch out
- The ladder keeps its alpha via -webkit-text-fill-color: rgb(29 29 31 / var(--fill)); that graded fill is the design, only the base colour changed.
- tests/text-colour-standard.test.ts now covers admin too; placeholder:/disabled: text-ink/NN variants remain exempt.
