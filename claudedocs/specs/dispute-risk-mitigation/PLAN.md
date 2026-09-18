# Dispute/Chargeback Risk Mitigation — Plan

Grounded in [SPEC.md](./SPEC.md) and this project's existing conventions (Next.js App
Router, Prisma/Supabase, Stripe webhook pattern already in `app/api/webhooks/stripe/route.ts`).

**Skill note (per standing CLAUDE.md workflow cadence):** this feature touches payments,
so `support-readiness` runs alongside implementation — the dispute-response SOP in item 4
below IS that runbook, not a separate pass added later.

## 1. Data model — extend `Order`, don't create a parallel table

Add to `prisma/schema.prisma`'s `Order` model:

```prisma
model Order {
  // ...existing fields...
  termsAcceptedAt   DateTime?
  termsVersion      String?     // matches EFFECTIVE_DATE in app/terms/page.tsx at time of order
  stripeChargeId    String?
  disputeId         String?     @unique
  disputeStatus     String?     // Stripe's dispute.status: needs_response | under_review | won | lost | warning_*
  disputeReason     String?     // Stripe's dispute.reason
  disputeAmount     Int?        // cents, matches Stripe's dispute.amount
  disputeOpenedAt   DateTime?
  disputeClosedAt   DateTime?
}
```

Rationale: a dispute always maps to exactly one order (via `stripeChargeId` /
`payment_intent`), so this is a 1:1 extension, not a new relation — matches this
project's existing preference for flat, denormalized order data over a normalized
dispute-events table, since disputes here don't need a history of state transitions
beyond current status (Stripe's own dashboard is the audit trail if that's ever needed).

## 2. Checkout consent gate — full policy inline, not a link

Per Stripe's own guidance (cited in SPEC.md): a link-only checkbox risks being rejected
as evidence. Build:

- A collapsed-by-default `<details>` block on `app/checkout/page.tsx` (same zero-JS
  accordion pattern already used in `UsageGuidance` and the homepage FAQ — no new
  pattern introduced) containing the full refund/terms text pulled from a single
  shared source (extract the refund-relevant sections of `app/terms/page.tsx` into a
  constant both pages import, so the checkout copy can never drift out of sync with
  the actual Terms page).
- A required checkbox, not pre-checked, immediately below it: "I have read and agree
  to the Refund Policy and Terms of Service."
- `app/api/checkout/route.ts` rejects the request (400) if the consent flag isn't
  `true` in the payload — server-side enforcement, not just a disabled submit button.
- On order creation, write `termsAcceptedAt: new Date()` and `termsVersion:
  EFFECTIVE_DATE` to the order.

This is the one piece that directly produces Stripe dispute *evidence* (the
"Refund policy details" section Stripe's response form asks for) — so it's the
highest-leverage item despite being the simplest to build.

## 3. Dispute webhook handling — extend the existing Stripe webhook route

Add to `app/api/webhooks/stripe/route.ts`, alongside the existing
`checkout.session.completed` handler (same file, same idempotency pattern — find the
order via `charge.payment_intent` → `metadata.orderId` on the original PaymentIntent,
or via `stripeChargeId` once populated):

- **`charge.dispute.created`**: write `disputeId`, `disputeStatus`, `disputeReason`,
  `disputeAmount`, `disputeOpenedAt` to the matched order. Fire the alert (see item 5).
- **`charge.dispute.closed`**: write final `disputeStatus` (`won`/`lost`) and
  `disputeClosedAt`.

This does NOT attempt to submit evidence programmatically (per SPEC.md's explicit
scope boundary — Stripe Smart Disputes / the Dashboard stays the actual response
mechanism). It exists purely to make dispute state visible against the order record
instead of only living in the Stripe Dashboard.

## 4. Dispute-rate monitor — the actual "before it's too late" mechanism

This is the piece that answers the real problem: Stripe notifies you *after* a network
already places you in a monitoring program (confirmed in SPEC.md's research) — a
lagging indicator. The fix is computing your own estimate continuously, which Stripe's
own docs explicitly endorse doing manually when you don't have Sigma/Data Pipeline.

- New module `lib/dispute-monitoring.ts`: computes, from the `Order` table directly
  (no external dependency — payments and disputes are already ours to query):
  - `paymentsLastMonth` = count of orders with `status: "paid"` captured in the
    previous calendar month
  - `disputesThisMonth` = count of orders with `disputeOpenedAt` in the current
    calendar month
  - `visaRatio` = disputesThisMonth / paymentsLastMonth, compared against Visa's 0.5%
    (non-compliant) / 1.5% (excessive, US) thresholds
  - `mastercardRatio` = same numerator, compared against Mastercard's 1.5%
    (ECM) / 3% (HECM) thresholds
  - Returns an explicit warning tier (`ok` / `approaching` / `over-threshold`) at a
    configurable early-warning fraction (e.g. 70% of the non-compliant threshold) —
    catching the trend before the monthly cutoff, not just replicating the network's
    own after-the-fact math.
- Run this check once daily via an in-process scheduled task started **after**
  `app.listen()` in the standalone server entry point (per this project's own
  `deploy-readiness-checklist` lesson already applied elsewhere in this repo — startup
  work must never block the port bind). A simple `setInterval` is sufficient at this
  order volume; this explicitly does not need a job queue or external scheduler.

## 5. Alert delivery — DECIDED: Hostinger's own SMTP, no new third-party service

User directed reusing the email service already included with Hostinger Business Web
Hosting rather than adding a provider like Resend. Implementation:

- `nodemailer` (well-established, zero-cost, no new external account) configured with
  Hostinger's SMTP host/port/credentials as env vars
  (`HOSTINGER_SMTP_HOST`/`PORT`/`USER`/`PASS` — added to `.env.example` with
  placeholders, actual values in `.env.local`/host env config, never committed).
- One small `lib/mail.ts` module wrapping `nodemailer.createTransport`, used for: the
  rate-monitor's threshold-warning alert (item 4) sent to `ORDERS_EMAIL`. Individual
  dispute-created events don't need a duplicate email — Stripe already sends one for
  free (confirmed in SPEC.md's research); item 3's webhook handler still records the
  dispute against the order regardless, for the site's own visibility.
- This is genuinely reusable beyond this feature (order confirmation emails, which
  don't exist yet either, could use the same `lib/mail.ts` later) — but building that
  is out of scope here; `lib/mail.ts` is written generically enough not to preclude it,
  without building it now (YAGNI).

## 6. Dispute response procedure — the support-readiness runbook

A markdown SOP (`claudedocs/specs/dispute-risk-mitigation/DISPUTE_RESPONSE_RUNBOOK.md`),
not code, covering (per Stripe's own `responding.md` guidance, cited in SPEC.md):

- Response window (7–21 days depending on network) and where to check it
  (`dashboard.stripe.com/disputes`, or the order's own dispute fields once item 3 ships)
- Evidence checklist per common dispute reason (product not received → tracking +
  delivery confirmation; product not as described → product page + description at
  time of order; fraudulent → the terms-acceptance timestamp from item 2, IP/AVS data
  Stripe already captures)
- Decision flow: contact customer first if resolvable amicably → accept if the claim
  is valid → counter with assembled evidence if not, submitted once (no edits after
  submission, per Stripe's own one-shot submission rule)
- Who does this at the current team size (you) — automated-resolution tier: none
  (dispute response always needs judgment); assisted-triage tier: this runbook; no
  incident-response tier needed yet at pre-launch volume

## Sequencing

1 → 2 → 3 → 6 can all ship before launch with no new dependencies. 4 → 5 need your
decision on the email provider (item 5) before implementation starts — everything
else is unblocked and I can proceed on those now if you'd like, or wait and do all six
together once that's decided.
