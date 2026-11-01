---
title: "Clinical Observations stays a visible placeholder: no testing data or approved wording exists in the repo"
author: Shams
date: 2026-10-31
branch: redesign/p3-homepage
cost: { minutes: 7, tokens: 56813 }
id: l-66cb1e28
scope: repo
status: active
src: agent
touches:
  - app/page.tsx
  - components/home/HomeObservations.tsx
  - app/journal/page.tsx
  - components/home/HomeClosing.tsx
  - components/home/HomeIntro.tsx
  - components/home/HomeJournal.tsx
  - lib/journal-entries.ts
  - tests/fix2-claims.test.ts
---

## Decided
- Homepage section 07 is `components/home/HomeObservations.tsx`: four fixed fields (participants, duration, observed outcomes, limitations), each "To be published", until Grazia Savoriti supplies approved content (owner, 2026-10-31). Kept visible per the Constitution rule that gaps are stated, not faked.

## Tried and ruled out
- Writing a description of the customer testing (photos, a 2-day interval): the repo contains no such text or data. The owner-approved "Customer Tested" and "clinically studied ingredients" claims exist only in memory notes; `tests/fix2-claims.test.ts` still bans "Customer Tested", the subject-N before/after photos and similar in `components/home`, `app/shop` and `app/page.tsx`.

## Watch out
- When Grazia's wording arrives, avoid the banned phrases or make a narrow, justified edit to `fix2-claims`; never add numbers or outcomes she has not supplied.
- Long shell commands with several heredocs and a `'''` Python block failed to parse here; write files with the editor tool and run Python from a file instead.
