# Day / Evening theme and the MotionSites motion pass

Status: IMPLEMENTED in the branch that adds this file; owner review of the visuals pending.
Date: 2026-11-12. Skills used: motionsites-web-builder (examples and motion values), spec-driven-development (this document), ui-ux-pro-max (contrast and interaction rules).

Evidence tags: **verified** = seen or measured this session, **inferred** = reasoned, **unknown** = not checked.

## 1. Specify

### Request
"Apply the motion skill to Chiarel. Ensure we can toggle dark/light. Ensure a luxury skincare design. It does not need to be dark if not needed."

### Interpretation (decided, not asked)
- A **toggle is required**, but dark is not the identity of the site. **Day is the default for every visitor** and stays exactly as it is today. **Evening** applies only when a visitor chooses it. Following the operating system's dark setting was rejected: the brand is tuned in light, and a luxury house should not turn dark by accident.
- The names mirror the Morning and Evening rituals (Day / Evening), not "Dark mode / Light mode".
- "Apply the motion skill" is scoped to the theme change and its control. The site's existing motion system (Reveal, per-product motion, ritual bands, hamburger morph) is mature and is not redone.

### Goal
A visitor can switch between Day and Evening from every public page, the switch is graceful, remembered, free of flashes, and Evening still reads as luxury skincare (warm, restrained, high-contrast type, no neon, no pure black).

### Success criteria
1. Day renders identically to production (same hex values; no layout change).
2. A header control switches Day and Evening on every public page, mobile and desktop, with a 44px target and an accessible name and state.
3. The choice persists across pages and visits, and Evening never flashes Day on load.
4. Every text and accent colour in Evening meets WCAG AA (4.5:1) against its background.
5. The switch is one grand gesture (a 900ms circular reveal from the toggle, falling back to a 650ms crossfade); `prefers-reduced-motion` gets an instant switch.
6. Product photography stays on its light plates (Evening does not recolour photos).
7. The admin console stays Day. `Footer.tsx` is not edited.

### Out of scope
Following the OS setting; a third "auto" state; redesigning sections; new copy; recolouring product photography; the Stripe-hosted pages.

## 2. Motion skill: examples chosen and what was taken

First pass used 3D Collectible Hero and Stillmind. Review: too playful and video-led for a luxury skincare house (the owner called the result "awful"). Second pass, chosen from all 40 examples for grandeur and opulence in a light-led, editorial register:
- **Neo Museum** (primary reference): an editorial museum page. A light `#fcfcfc` page meets a deep dark section; mega display type; hairline rules; numbered chapters (`01 / 05`); the dark section's slow, confident motion (1.2s, `cubic-bezier(0.16,1,0.3,1)`). Chiarel already has the numerals, rules and display type, so the work here is making the dark half (Evening) feel like the museum's dark gallery: deep, warm, almost black, with fine light rules.
- **PROMPT** (fashion archive): light and dark surfaces meeting as one deliberate transition, and restraint (one typeface, one weight, nothing decorative). Taken as the principle for the theme switch: a single large, slow gesture.
- Kept from the first pass: the 650ms `cubic-bezier(0.4,0,0.2,1)` colour crossfade (3D Collectible Hero) as the fallback, and the 300ms glyph swap (Stillmind).
- Rejected: Bloom AI (grayscale glass over video, wrong for the brand), video backgrounds, glass nav, extra typefaces (Libre Bodoni only), grain, ambient loops.
- **The signature moment** is not in the skill: the toggle opens the new theme as a circle from the button over 900ms on `cubic-bezier(0.22,1,0.36,1)` (View Transitions API), like the lights of the House going down. Browsers without it, and reduced motion, get the crossfade or an instant switch.

## 3. Plan (what was built)

1. **Tokens.** Tailwind colours became CSS variables (`rgb(var(--c-ink) / <alpha-value>)`), so every existing class works in both themes and opacity utilities (`border-ink/15`) keep working. Day values are the brand hexes. Values live in `app/globals.css`.
2. **Evening palette** (inversion of the brand palette, pairs invert together so no component needs a theme class):

| Token | Day | Evening | Evening contrast |
|---|---|---|---|
| page (`cloud`) | `#F5F5F7` | `#181412` warm espresso | n/a |
| text (`ink`) | `#1D1D1F` | `#F5F0E8` warm ivory | 16.13:1 on page |
| raised surface (`white`, `ivory`) | `#FFFFFF` | `#25201D` | text 14.21:1 |
| `ochre` text and accents | `#9B4722` | `#D9855E` | 6.51:1 on page, 5.73:1 on surface |
| `garden` text and accents | `#1F5129` | `#7AA482` sage | 6.50:1 on page |
| `champagne` | `#D6C5A0` | unchanged | 10.76:1 |
| hairlines (`soft`, `border-ink/10..20`) | grey ink | **champagne gold** at 22 to 28% | n/a |
| solid terracotta and green fills (`bg-ochre`, `bg-garden`) | deep `#9B4722`, `#1F5129` | **unchanged jewel tones**, light text | as Day |
| overlay veil (`scrim`) | ink | black | n/a |

Day ochre is 5.81:1 on its page, so the accent keeps the same weight in both themes. Opulence rules: (1) the Evening page is a warm espresso, not neutral grey; (2) a solid terracotta or green fill is a jewel and never turns pastel; (3) hairlines are gold; (4) the Morning Ritual champagne tint becomes umber (over espresso it would read olive-grey).
3. **No-flash script** (`lib/theme.ts`, inline in `<head>`): sets `data-theme` before paint from `localStorage`; forces Day on `/admin`; any storage failure falls back to Day.
4. **Toggle** (`components/ThemeToggle.tsx`) in the header next to Bag; `aria-pressed`, label "Switch to Evening" or "Switch to Day".
5. **Logos:** the header wordmark and House lockup exist as ink PNGs; cloud-coloured copies were generated from the same alpha channel (`chiarel-header-*-cloud-v2.png`) and swap with the theme, also in the checkout header.
6. **Light plates:** an element that paints its own light background (the featured Neck panel on /shop) carries `data-theme="light"`, which restores the Day palette inside it so text on the plate stays dark. Image-only frames need nothing.
7. **Overlay veils** (cart drawer, mobile menu) use a `scrim` token so they stay dark in Evening.
8. **Footer:** untouched; it inherits the tokens. One CSS rule keeps its link hover readable on the Evening terracotta card.

## 4. Owner decisions made by default (say if you want any changed)

- **D1** Default is Day for everyone; no OS following. (Reversible: one line in `lib/theme.ts`.)
- **D2** Evening ochre `#D9855E` and garden `#7AA482` are new brand-adjacent values, derived only to meet AA. Day values are unchanged.
- **D3** Product plates and photography stay light in Evening (like jewellery on a pale plate), not recoloured.

## 5. Verification and honest gaps

Verification evidence is recorded in the pull request. Not covered: every one of the roughly 50 routes in Evening was not individually inspected; the Stripe payment pages are outside our control; the hero animation scene (`HeroIntro`) uses fixed skin-tone colours and is treated as a light plate.
