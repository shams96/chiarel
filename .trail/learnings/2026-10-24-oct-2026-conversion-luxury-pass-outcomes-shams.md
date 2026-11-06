---
title: "Oct 2026 conversion/luxury pass outcomes: merged PRs, pricing/offer decisions,…"
author: Shams
date: 2026-10-24
id: l-4445cdc0
scope: repo
status: active
touches:
  - tests/founding-members-copy.test.ts
---

## Decided
Merged to main (Oct 14-15 2026): #17-#24 audit/SEO/analytics/chrome/PDP, #26 per-day price headline (Essence $3.36/day; one 90-day delivery, owner said "one mail, not two"), #28 closed-drawer shadow fix, #29 Recovery Masque jar now `recovery-masque-jar.jpg` (compressed 180 KB; owner-chosen AI lifestyle image, label says "rejuvenates skin" and backdrop is Capri: flagged, not changed).

Open: #25 email signup mounts (flag `NEXT_PUBLIC_EMAIL_SIGNUP=on`, hidden until EmailSubscriber table is in prod); #27 Founding Members (replaces Founding 100 discount/refund/Circle with numbered places + 48h early access; flat 2x Ritual Plan for all products; ticker rewritten; Instagram field removed). Owner: merge #27 ONLY after counsel approves, and confirm 48h early access is deliverable.

**Why:** discount framing undercuts luxury (La Mer leads with gifts/points; Augustinus Bader's free Club with points, tiered early access, birthday gift); paying refunds for video/photos is an incentivised testimonial.

## Watch out
never reintroduce "half price", refund-for-content or % off founder copy; tests/founding-members-copy.test.ts guards it. Shipping: owner asked who pays; recommended brand absorbs for Ritual Plan/subscriptions (peers do); carrier cost and free threshold still unknown, so no free-shipping claim yet.

Dev-server hang cause (not normal): stale `.next/standalone/server.js` processes (ports 4800-4802) plus a surviving `next build` locked/raced `.next`; killing them and `rm -rf .next` fixed it (Ready 3.8s). Stopping a background task does not kill its child node processes: check `Get-CimInstance Win3
…

_From Claude Code's memory of this repo, last updated Oct 15._
