# Plan: Luxury experience pass

Phase 2 of spec-driven-development (how). Follows `SPEC.md` (goals G1-G5, owner answers in section 10) and `claudedocs/specs/CONSTITUTION.md`.
Status: DRAFT for owner review. Detailed for W1 (the first workstream by D1); W2-W4 are outlined and get their own plan before they start.

Evidence tags: **V** verified this session (file read), **I** inferred, **U** unknown.

## 0. Decisions this plan assumes

- Reframe adopted as the filter: problem first, then what the products do, then provenance as support.
- **Mission line stays the h1** ("Advancing Cellular Clarity™", Decision 037) and a problem line sits beside it (option a). Demoting the h1 is not planned; the owner can still choose option b.
- **No comparative ageing claim** about neck vs face. Copy uses wording already in the repo.
- Real photography only; no AI imagery; no invented scarcity, reviews or label text.

## 1. Inventory (the spec's unknowns, resolved)

Homepage section order (V, `app/page.tsx`): Hero, Intro (mission statement), Ritual, Face and Beyond, Icon Product (Day Crème), Fit Guidance, Proof, Formulation Record, Observations (placeholder), Italy, Formulator, Philosophy, Journal, FAQ, Final CTA, email signup.

| Finding | Evidence |
|---|---|
| **On phones the hero text comes before the photograph.** The text block and the image frame are both full-width columns and the text is first in the DOM, so the only photograph is below the poster headline, button, price line and a paragraph. This, not a lack of photography, is why the first screen reads text-heavy. Measured on live chiarel.com at 390x844 on 2026-11-05: h1 top 184px, button top 473px, **photograph top 934px, so none of it is visible on first load** (image height 436px). | V: `HomeHero.tsx` structure, `col-span-4` on both blocks; live measurement |
| The hero image is correct for LCP (`priority`, 960w variant) and its alt text is descriptive. | V: `tests/focus-ladder-direction.test.tsx:70-77` |
| The first-screen paragraph is formulation-first ("peptide and postbiotic precision"). The problem language already exists elsewhere in ratified copy. | V: `HomeHero.tsx:54-61`; `app/science/page.tsx:9,56` |
| `/assessment` is linked from one mid-page text link on the homepage (Fit Guidance), the ritual page, one journal article and the sitemap. Not from the hero, the header or product pages. | V: grep of `app`, `components`, `lib` |
| The homepage "Proof" section is ingredient families only. There is no customer-evidence section on the homepage. Whether product pages show the approved "Customer Tested" photos is unchecked. | V for homepage (`HomeProof.tsx`); U for PDP |
| Hero tests pin the h1 markup, the single CTA, the price line, the ochre frame and the mirror-scene image. They must be updated deliberately, not skipped. | V: `tests/focus-ladder-direction.test.tsx:44-81` |
| The old hero branch `feat/home-hero-one-frame` is from 2026-10-17 and 163 commits behind `main`; the hero was rewritten since. It is stale, not an overlap. | V: git |
| Approved copy sources for the problem line: "dry indoor air, screens, commutes and too little sleep" (`app/science/barrier-resilience/page.tsx:14`); "the daily load on a working woman's body and skin" (`app/science/page.tsx:9`); "the same discipline is rarely applied" to the neck and décolleté (`HomeHero.tsx:59-60`). | V |

## 2. W1: Hero and sensory (first PR)

Goal G1: in the first 3-4 seconds on a phone the visitor sees the product world and a problem she recognises, with the mission line intact.

### 2.1 Changes

1. **Image first on small screens.** Reorder so the photograph frame is visible in the first viewport at 390px, with the poster headline and the Begin the Ritual button immediately under or over it. No new image: the Essence mirror scene stays as the LCP image. Desktop layout (text left, frame right) is unchanged.
2. **Problem line replaces the formulation paragraph in the hero.** One short line above the paragraph slot. The formulation paragraph moves down to the Intro section's supporting line (it already holds the formulation line) so no ratified sentence is lost.
3. **Quiet reveal.** Use the existing `hero-in` stagger and `Reveal` for the frame (opacity and a few pixels of rise, 600-800 ms); `prefers-reduced-motion` already disables it (`globals.css:158-167`). No new animation library, no autoplay video in W1.
4. **Face and neck in one glance (optional, owner choice).** A second, smaller frame using the existing Neck scene photograph below the main frame on desktop, so the hero shows both. Off by default; adds one image request.

### 2.2 Copy (DRAFT, owner approves before code; each runs `claim-audit`)

All wording below is rearranged from copy already in the repo; none adds a claim.

| Slot | Option A | Option B |
|---|---|---|
| Problem line | "For skin under the daily load of screens, dry air and too little sleep." | "Face and neck, morning and night, treated with the same discipline." |
| Source | `barrier-resilience/page.tsx:14`, `science/page.tsx:9` | `HomeHero.tsx:59-60`, ritual AM/PM |
| Risk | Names causes, not outcomes; acceptable if kept as "daily load" | Fine; "treated" refers to routine, not a skin result |

Not used: any statement that the neck ages faster than the face; "restore", "relief" (claim-audit first).

### 2.3 Files

- `components/home/HomeHero.tsx` (structure and copy), `app/globals.css` (only if the reorder needs a class; prefer Tailwind order utilities).
- `tests/focus-ladder-direction.test.tsx` (hero block: update the pinned structure and add the new assertions below).

### 2.4 Tests

- Keep: one h1 with the mission line, `href="/ritual"`, "Begin the Ritual", price line, `fetchPriority="high"`, the mirror image.
- Add: below 768px the frame precedes the h1 in DOM or visual order (assert the order class); the problem line is present and is one of the approved strings; no hero paragraph contains the words "peptide" or "postbiotic" (moved down); reduced-motion rule still present.
- Mutation-check the new assertions (break the reorder, confirm a test fails).

### 2.5 Verification (production build, not the dev server)

- Screenshots at 390, 768, 1280 px before and after; photograph visible in the first viewport at 390px.
- Lighthouse mobile LCP before and after; must not be worse.
- Axe on `/`; one h1; tab order unchanged.
- Skills at gates: `claim-audit` on the problem line before coding; `ui-ux-pro-max` audit after.

### 2.6 Out of scope for W1

Video in the hero, new photography, the clinical section wording (small copy edit goes in W2), assessment entry points (W3), unboxing (W4).

## 3. W3: Guided Path (outline; own plan before it starts)

- Make the existing `/assessment` findable: a secondary link in the hero area and from product pages, with a one-line promise ("Eight questions, two minutes") only if the 8-question count and timing are verified.
- Keep results anti-upsell (1-2 products); add "add to bag" from results (cart context already wired).
- Check the instrument's claim wording ("four-axis dermatological framework") with `claim-audit`.
- Unknown: PDP social proof inventory (do the approved customer-tested photos appear?).

## 4. W2: Story Depth (outline)

- One ordered "world" per product on the PDP: problem she lives with, what it does (ratified "the look of" wording), place, ritual moment, ingredient record. Provenance facts only from verified research (the spring source, not waterfall height).
- Clinical Observations: soften the line per D2 ("Clinical observations are being prepared for publication"); keep the four fields visible.

## 5. W4: Luxury Cues (outline; blocked)

- Unboxing and packaging reveal section/page. Blocked on D4: the owner supplies real photos or video of the carton, ribbon and jar/pump reveal. Nothing built from placeholders.

## 6. Sequencing and delivery

1. This docs PR (spec and plan) merges when the owner says so.
2. W1 branch from `main`, one PR. W3, W2, W4 each their own PR after their own plan.
3. Nothing deploys until the owner says "merge N" (Hostinger auto-deploys from `main`).

## 7. Risks

| Risk | Mitigation |
|---|---|
| Reorder breaks the poster headline layout or the Focus Ladder tests | Update tests deliberately; visual diff at three widths |
| LCP regression | Same LCP image and sizes; measure on a production build |
| Problem line reads as a claim | Approved-source wording only; `claim-audit`; owner approves |
| Scope drift into pricing or positioning | Non-goals in SPEC section 4; mission h1 unchanged |

## 8. Owner decisions for this plan

| # | Decision | Default |
|---|---|---|
| P1 | Problem line: Option A, B, or your own wording (I run claim-audit on it) | Option A |
| P2 | Add the second (neck) frame to the hero | Off |
| P3 | Confirm the mission stays the h1 (option a) | Yes |
