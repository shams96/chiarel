---
title: "Footer wordmark: original design, R centred on the card seam"
author: Shams
date: 2026-11-01
branch: redesign/p6-qa
cost: { minutes: 10, tokens: 44918 }
id: l-76c14979
scope: repo
status: active
replaces: l-24992747
src: agent
touches:
  - components/Footer.tsx
  - app/globals.css
---

## Decided
`components/Footer.tsx`: the outlined CHIAREL wordmark crosses both cards by design (owner confirmed) and stays in the original desktop design: two tinted copies, 9vw, no reserved band, no new container. Its left offset is `calc((100%-1.25rem)/3+0.625rem-25.2vw)` so the R (2.8em from the word's left edge, em = 9vw) is centred on the seam, and both clip-paths switch at `25.2vw` from the word's left. Below md a seam version (`.wordmark-seam-top/bottom` in `app/globals.css`) sits between the stacked cards (left card 280px, gap 4px). Heading is one line "Write to the House →".

## Tried and ruled out
A reserved top band with cqw sizing, shared container and 12px text floor was built and rejected by the owner: they only asked for the word to be lowered and padded. Percent clip-paths on the word's own box (old 66.666%/33.333%) never matched the card seam.

## Watch out
Centring the R puts "EL" under the "Write to the House" heading at md+; the owner has not yet chosen between moving the heading below the word or to the right of the L. If the left card height (280px) or gap changes, retune the seam `top-[calc(282px-5.75vw)]`.
