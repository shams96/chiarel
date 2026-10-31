---
title: Favicon is a champagne circle with the Ink monogram; apple and maskable icons stay full-bleed squares
author: Shams
date: 2026-10-31
branch: brand/favicon-red
id: l-19c30ee5
scope: repo
status: active
src: agent
touches:
  - app/icon.png
  - app/favicon.ico
  - public/icon-192.png
  - public/icon-512.png
  - app/apple-icon.png
  - public/icon-maskable-512.png
---

## Decided
Browser tab and 192/512 "any" icons (app/icon.png, app/favicon.ico, public/icon-192.png, public/icon-512.png) are a Champagne #D6C5A0 circle with an Ink #1C1A17 monogram (10.2:1). It was the only gold icon in a mock tab row, so it stands out on white and dark tabs.
app/apple-icon.png and public/icon-maskable-512.png stay full-bleed gold squares (maskable mark inside the safe zone) because iOS and Android apply their own mask.

## Tried and ruled out
Red Ochre tile with Peach Dust mark: blends in among red favicons. Red circle with a gold ring: too busy at 16 px. Ivory circle with red ring: reads like the default globe icon.

## Watch out
Browsers cache favicons hard; hard-refresh to see a change. Champagne on white is only 1.7:1, so the circle edge is faint on a white tab and the Ink mark carries legibility; never shrink the mark.
