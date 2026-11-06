---
title: "Homepage byline belongs inside the final section, not after it"
author: Shams
date: 2026-11-06
branch: fix/home-byline-placement
cost: { minutes: 6, tokens: 149823 }
id: l-584bb4ba
scope: repo
status: active
src: agent
touches:
  - components/home/HomeClosing.tsx
  - app/page.tsx
  - tests/home-byline.test.tsx
---

## Decided
The homepage authorship line ("Written by Grazia Savoriti ...") lives inside HomeFinalCta (components/home/HomeClosing.tsx), on the same container as the section above, left-aligned with a hairline. app/page.tsx renders nothing between that section and the footer.

## Tried and ruled out
Leaving the line as a bare centred <p> in app/page.tsx after the last section: it sat outside every container, so on a wide screen it floated alone above the footer. The EmailSignup wrapper (px-6 pb-10) was also rendered unconditionally while EmailSignup returns null unless NEXT_PUBLIC_EMAIL_SIGNUP is "on", leaving a 40px empty gap. It is now conditional.

## Watch out
Verify layout fixes on a dev server that serves the branch you are on. The reused :4600 server served a different checkout and showed the old layout. Do not add anything between HomeFinalCta and the footer. The footer wordmark straddling the two cards is deliberate design (Footer.tsx is off-limits).
