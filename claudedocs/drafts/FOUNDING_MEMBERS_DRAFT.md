# Founding Members: draft for owner and counsel review (2026-10-14)

Status: DRAFT. Nothing here is live and no code has been changed. Terms need attorney review before use.
Perks marked [CONFIRM] are proposals; each must be something CHIAREL can actually deliver and afford.

## Why replace the Founding 100 mechanic
- "Half price", "we return the rest" and "net free for ninety days" are discount framing. La Mer leads with a gift and a points
  programme; Augustinus Bader leads with a free membership club (points, early access, birthday gift). Neither headlines a
  markdown on its own site.
- A refund or credit paid in exchange for a video and before/after photos is an incentivised testimonial (FTC disclosure,
  platform rules, EU consumer rules). Removing the payment removes most of the risk.
- The live page, the banner and the checkout disagree: the page says 50% off, `lib/founding100.ts` applies 20% off plus a
  25% credit back. One honest offer ends that.

## The offer
Full price. Scarcity stays, because it is real: 100 numbered places. Membership is recognition and access, not money.

| Perk | Notes |
|---|---|
| A member number, 001 to 100, on a printed card in the box | [CONFIRM] print cost only |
| Early access to every new CHIAREL launch, 48 hours before the public | Needs a launch-notification list (email signup is built, flag-gated) |
| A complimentary mini of the next launch, sent with it | [CONFIRM] depends on a launch date and mini format |
| A note from the formulator, Grazia Savoriti, in the first box | [CONFIRM] she must agree; printed, not personalised |
| Optional: name on a Founders' register on the site | Opt-in only |
| The Ritual Plan saving that already applies to everyone | One payment for 90 days, one package; saves versus buying twice one-time. A published standard price, not a founders-only discount |

Not included: any discount, refund or credit tied to content.

## Page copy (replaces app/founding-100/page.tsx hero and "How it works")
Route stays `/founding-100` (existing links, sitemap). Visible name changes to "The Founding Members".

Eyebrow: By invitation · The House Opens
H1: The Founding Members
Lead: One hundred places. Each one numbered. We are opening the House to its first hundred members, and they will meet
every new formula before anyone else.
Counter (real count of saved sign-ups, unchanged): "{n} of 100 places remaining. No more once they are claimed."

How it works:
1. Join. Choose your ritual at its published price. The 90-day Ritual Plan arrives in one package.
2. Receive. Your member number, a note from our formulator, and a place on the early-access list.
3. Meet each launch first. Members hear 48 hours before everyone else, with a complimentary mini of the next formula.
4. Tell us the truth. If you choose to share your experience, we ask only for an honest account. Positive is never
   required, and nothing is paid, refunded or credited for it.

## Terms (draft)
- **Founding Members.** Limited to the first 100 qualifying orders. A qualifying order is one 90-day Ritual Plan purchase of
  an enrolled product at its published price. Limit one enrolment per household. Membership benefits are listed on this
  page and may be updated for future members without affecting existing members' benefits.
- **No payment for content.** Members are never required to submit content and receive nothing in exchange for it. Any
  content a member chooses to share must be an honest account of their experience. Where a member receives a complimentary
  item that is part of membership, CHIAREL will disclose that connection when it republishes the content.
- **Content rights.** Only for content a member voluntarily submits: a non-exclusive, worldwide licence to display it on
  CHIAREL channels, with the member's permission for each use. The member retains ownership. [COUNSEL: replaces the
  "perpetual, irrevocable" grant, which is out of step with a no-payment programme.]
- **Delivery.** The 90-day supply ships in one package. [CONFIRM shipping terms once carrier cost is known.]
- Founding Members is a provisional name pending trademark clearance.

Removed from the current terms: the 50% price, the refund or credit of the remaining balance, the 30-day submission
window, and the CHIAREL Circle (20% off plus 25% credit back). Recommend retiring the Circle for the same reasons; a points
club can follow once there are customers.

## Sitewide banner (components/Header.tsx:28, :67; ComingSoonPackshot.tsx:70)
Current: "The 90-Day Ritual, half price. We return the rest." Replace with one of:
- "The Founding Members: 100 numbered places. Early access to every launch."
- "Be one of the first hundred. Meet each new formula 48 hours early."

## Code impact when approved (separate PR, after counsel)
1. `lib/founding100.ts`: remove the 20% / 25% pricing, or stop enrolling products (`FOUNDING_100_SLUGS`). Then `computeUnitPrice`
   returns the flat 2x subscription price for every product, and the Ritual Plan saving is the same for all.
2. `PurchaseOptions.tsx`: remove the "20% off · credited back" line; the PDP then shows the standard Ritual Plan only.
3. `/api/checkout` and the `Order.founding100Credit` ledger field plus `/admin/founding100-credits`: stop writing credits.
   Keep the column (data migration not needed); drop the admin page or leave it read-only for any test records.
4. `app/founding-100/page.tsx`: rewrite per this draft; update metadata description and OG text; remove the Circle section.
5. `lib/pricing.test.ts` and `tests/pdp-purchase-options.test.ts` pin the 20% N1 maths: update to the flat Ritual Plan.
6. Update `/llms.txt`, FAQ and any JSON-LD that mention half price or credit back. Search for "half price", "Circle", "credit".

## Decisions for the owner
- Which perks can CHIAREL really deliver, and at what cost per member (printed card, mini, formulator note)?
- Keep the 90-day Ritual Plan saving for everyone (recommended), or make it a members-only perk?
- Retire the Circle (recommended)?
- Does Recovery Masque launch soon enough for the 48-hour early-access promise to mean something?
- Counsel: incentive disclosure, the content licence, the program name, and refund law for any existing enrolments.
