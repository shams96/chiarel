---
title: "Day/Evening theme: colour tokens are CSS variables; Evening must be warm, jewel-filled and gold-ruled, not an inverted grey"
author: Shams
date: 2026-11-12
branch: feat/day-evening-theme
cost: { minutes: 24, tokens: 565797 }
id: l-f85bcd80
scope: repo
status: active
src: agent
touches:
  - lib/theme.ts
  - components/ThemeToggle.tsx
  - claudedocs/specs/day-evening-theme/SPEC-AND-PLAN.md
  - tests/day-evening-theme.test.ts
  - app/globals.css
  - components/Header.tsx
---

## Decided
- Tailwind brand colours are `rgb(var(--c-x) / <alpha-value>)`; values live in app/globals.css (Day = brand hexes, Evening in [data-theme="dark"]). Pairs invert together, so components need no theme classes. Day is default for everyone; Evening only after the header toggle (localStorage chiarel-theme); admin always Day; no OS following.
- Evening: warm espresso page #181412, ivory text, gold (champagne) hairlines, and solid bg-ochre/bg-garden fills KEEP their Day jewel palette via a CSS rule (no pastel blocks). Footer.tsx is untouched and inherits all of this.
- Toggle opens the new theme as a 900ms circle from the button (View Transitions API), fallback 650ms crossfade, instant on reduced motion.
- Reference examples: Neo Museum (primary) and PROMPT, after the owner rejected the first pass (3D Collectible Hero and Stillmind were too playful).

## Tried and ruled out
- Plain inversion of the brand palette: pastel terracotta and mint blocks, grey page, muddy champagne band. The owner called it awful.
- Following prefers-color-scheme: a luxury house should not turn dark by accident.

## Watch out
- Text colour is inherited, not recomputed: a `data-theme="light"` wrapper inside Evening also needs the `[data-theme="light"]:not(:root)` colour rule (already in globals.css), else its text stays light on a light plate.
- tests/soft-ink, text-colour-standard and focus-ladder pin the Day ink via the variable, not a hex.
- The dev server breaks after compiling /account/login or /admin/login when oauth4webapi is missing locally; restart it and avoid those routes.
- A worktree reached through a C:\ junction and a D:\ path makes Next build a doubled path; run `next dev` from the D:\ path, not the preview launcher.
