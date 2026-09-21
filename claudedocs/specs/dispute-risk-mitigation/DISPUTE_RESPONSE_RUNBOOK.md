# Dispute Response Runbook

Written per Stripe's own `responding.md` guidance (cited in SPEC.md). This is the
`support-readiness` artifact for this feature — dispute response always needs human
judgment, so there is no automated-resolution tier here; this runbook is the
assisted-triage tier, which is the right tier at Chiarel's current team size (you).

## When a dispute lands

You'll be notified two ways once this feature is live: Stripe's own email (sent
automatically on `charge.dispute.created` — no code needed for this, it's already
free) and the order record itself now carries `disputeStatus`/`disputeReason` once
the webhook handler in `app/api/webhooks/stripe/route.ts` processes the event.

**Response window: 7–21 days depending on the card network.** Check the exact
deadline in `dashboard.stripe.com/disputes` — don't estimate it. Missing the deadline
means an automatic loss with no appeal.

## Step 1 — Understand the claim

Open the dispute in the Stripe Dashboard. Read the bank's submitted claim text if
provided (not always available). Note the `reason` code — it determines what evidence
actually matters (see the checklist below).

## Step 2 — Try to resolve it directly first

Stripe's dispute page usually offers a way to email the customer. Do this before
deciding to contest — if the complaint is legitimate or easily resolved (wrong size,
minor issue), a store credit, replacement, or an apology can get the customer to
withdraw the dispute entirely, which is strictly better than winning a contested one
(no dispute fee dispute either way, but a withdrawn dispute doesn't cost the
relationship or risk a "lost" outcome on your record).

## Step 3 — Decide: accept or contest

**Accept if**: the claim is valid (product genuinely not delivered, genuinely
defective, or a legitimate double-charge). Contesting a valid claim just delays the
inevitable and burns a dispute-received fee for nothing.

**Contest if**: you have real evidence the claim is wrong. Evidence checklist by
common reason code:

| Dispute reason | Evidence to gather |
|---|---|
| Product not received | Tracking number + carrier delivery confirmation (screenshot, not a link — card issuers don't follow links) |
| Product not as described | The product page content and images *as they were at the time of the order* (check `createdAt` on the order, compare against the product's current content if it's changed since) |
| Fraudulent / unauthorized | The order's `termsAcceptedAt`/`termsVersion` (proves policy agreement), the billing/shipping address match, and whatever AVS/CVC data Stripe already captured on that PaymentIntent |
| Subscription cancelled | Confirmation the cancellation request (if any) predates or postdates the disputed charge — check `orders@chiarel.com` correspondence |
| Duplicate charge | The two Stripe charge IDs side by side, showing they're for genuinely separate orders (or proof only one order was ever fulfilled) |
| General / unrecognized charge | Your statement descriptor and a copy of the order confirmation email sent to the customer |

## Step 4 — Submit once, correctly

Stripe's evidence submission is **one-shot — no edits after submitting.** Assemble
everything before opening the response form. Combine same-type evidence into a single
file (Stripe only accepts one file per evidence type). Keep the combined file size
under 4.5MB. No links, no requests to "call us" — issuing banks don't follow links or
make calls; only the uploaded documents are reviewed.

## Step 5 — Track the outcome

Stripe emails the decision (`won`/`lost`) and the webhook handler in this codebase
records `disputeStatus`/`disputeClosedAt` on the order automatically. A `lost` dispute
is final — the refund stands and the dispute fee isn't returned. A `won` dispute
returns the disputed amount; the dispute fee is not returned (except in Mexico).

## Support tier for this feature

- **Automated resolution**: none. Dispute response is never a narrow, pre-approved,
  reversible action — it always needs judgment on the specific claim.
- **Assisted triage** (this runbook): the default and, at current volume, the only
  tier needed. You diagnose using the checklist above and act directly in the Stripe
  Dashboard.
- **Incident response**: not needed yet. If dispute volume ever grows enough that
  responses start slipping past the 7–21 day window, that's the trigger to revisit
  this and build an actual queue/reminder system — not before, per this project's
  own no-speculative-features rule.
