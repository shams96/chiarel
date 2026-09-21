# Dispute/Chargeback Risk Mitigation — Spec

**Trigger:** user flagged a Facebook video about a Stripe account being frozen after
unmanaged disputes, and asked for three things: (1) a published refund policy/terms
visible before payment, (2) proactive chargeback threshold alerting instead of reacting
after Stripe/the card networks already act, (3) a dispute response workflow matching
market leaders.

**Status: pre-launch hardening, not incident response.** Chiarel is running on Stripe
in test mode — not live, no real transactions, no real disputes exist yet (confirmed
by the user 2026-09-16). This is preventive infrastructure to have correct *before*
going live, not a reaction to an active account freeze. That changes urgency but not
scope: everything below should still be in place before the account starts taking real
payments, since retrofitting a dispute-agreement checkbox after live transactions have
already happened wouldn't cover the transactions that already occurred.

**Not legal advice.** The terms language drafted in the Plan/Implement phases is a
professional drafting pass grounded in Stripe's and the card networks' own published
requirements — it is not a substitute for a licensed attorney reviewing the final
Terms of Service and Refund Policy before they govern real transactions with real
dispute exposure. Flagging this explicitly per this project's own standing rule (see
`ui-ux-pro-max` disclaimer guidance) rather than presenting drafted legal text as final.

## Confirmed current state (read from the actual codebase, not assumed)

- **Controlling entity is already established**: `1HubSolutions, LLC` is the legal name
  used consistently across `app/terms/page.tsx`, `app/contact/page.tsx`,
  `app/press/page.tsx`, `components/Footer.tsx`, and `lib/seo.ts` (`legalName` field).
  This answers "app vs. controlling company" — it's the controlling company, already in
  place. New terms language stays under 1HubSolutions, LLC; no new entity is introduced.
- **A Terms of Service page already exists** (`app/terms/page.tsx`) with a refund
  section (90-Day Guarantee + Returns & exchanges) — the *content* isn't missing, but:
  - **It is not shown or linked anywhere on the checkout page**
    (`app/checkout/page.tsx`) before the customer submits payment. Confirmed by reading
    the file: no `/terms` link, no checkbox, no policy text anywhere in the checkout form.
  - Per Stripe's own dispute-prevention guidance (`docs.stripe.com/disputes/prevention/best-practices`):
    > "Rather than only linking to them during checkout, provide a full version of them
    > on the checkout page or as a pop-up with a requirement to agree to them prior to
    > submitting the order... If you have a checkbox that only contains a link, the
    > issuer might reject it as unsatisfactory evidence."

    A bare link (even if added) would likely not hold up as dispute evidence. This is
    the actual, confirmed gap — not a hypothetical.
- **Zero dispute-handling exists in code.** `app/api/webhooks/stripe/route.ts` only
  handles `checkout.session.completed`. No handler for `charge.dispute.created`,
  `charge.dispute.closed`, or any other dispute event. No alerting, no dashboard, no
  record of a dispute ever touching the Order model.
- **The `Order` Prisma model has no dispute-related fields** (`prisma/schema.prisma`):
  no `stripeChargeId`, no `disputeStatus`, no evidence/communication log. Nothing to
  build an evidence packet from today beyond what's already in Stripe's own dashboard.

## Real thresholds this account is actually exposed to (Stripe docs, cited)

Card networks track *dispute count/rate*, not outcome — a dispute you win still counts
against these thresholds. Source: `docs.stripe.com/disputes/monitoring-programs`.

| Program | Non-compliant / entry threshold | Escalated tier | What happens |
|---|---|---|---|
| Visa VAMP | 5 disputes+fraud, 0.5% ratio | 1,500 count / 1.5% ratio (US) — "Excessive" | Fines begin; Stripe notifies account |
| Mastercard ECM | 100–299 chargebacks, 1.5–2.99% rate | 300+, 3%+ → HECM | $0 month 1, $1,000 months 2–3, up to $100,000+/mo at 19+ months in program |

Mastercard exits require the rate to stay *below* threshold for **3 consecutive
months** — a single bad month is expensive and slow to undo, which is exactly why
"catch it before the monthly report" (ask #2) has real teeth: Visa/Mastercard compute
this monthly from the *prior* month's data, so this month's disputes decide next
month's standing, not this month's.

## Scope

### In scope
1. Refund/dispute policy content correct, complete, and **actually presented at
   checkout** — full text or an inline expandable section plus a real checkbox
   agreement, not a bare link — recorded against the order at time of purchase.
2. A dispute webhook handler (`charge.dispute.created` / `.closed`) that persists
   dispute state against the `Order` record and fires an alert (email, at minimum)
   the moment a dispute is created — not a monthly-report-driven reaction.
3. A running dispute-rate calculation against Stripe's own formula (disputes this
   month ÷ payments prior month) surfaced somewhere the user actually sees it, with a
   threshold warning before hitting Visa/Mastercard's own non-compliant tier — not
   waiting for Stripe/the networks to notify first.
4. A documented, repeatable dispute-response procedure (what evidence to gather, in
   what timeframe, per Stripe's own `responding.md` guidance) so a dispute doesn't sit
   unanswered until the 7–21 day window lapses.

### Out of scope (explicitly, to bound this)
- Third-party pre-dispute alert networks (Ethoca/Verifi, Stripe's "prevention"
  product) — real and Stripe-recommended, but a paid add-on/contract decision, not
  something to silently wire up. Flagged as a recommendation, not built.
- Automating dispute *response submission* itself (Stripe Smart Disputes exists but
  is a Stripe-side product decision, not something this spec builds from scratch).
- Retroactively re-litigating any dispute already in progress — moot for now since the
  account is in test mode with no real disputes, but if that ever changes, responding
  to an active dispute in the Stripe Dashboard is always immediate and separate from
  this engineering work, not something to wait on this cycle for.
- Rewriting the *substance* of the refund policy (90-Day Guarantee terms) — this spec
  makes the existing policy visible and agreed-to correctly; changing what the policy
  actually promises is a business decision for the user, not an engineering one.

## What "solved" looks like

- A customer cannot reach the payment step without the refund/dispute policy being
  shown in full and explicitly agreed to, with that agreement recorded against the
  order.
- A new dispute triggers an immediate, specific alert (not silence until a monthly
  report) and is visible with its status against the order.
- Dispute rate is visible before it crosses Visa/Mastercard's own thresholds, not
  discovered after a fine notice.
- There's a written procedure for responding to a dispute that matches what Stripe's
  own guidance says wins disputes (fast response, complete evidence, tracking info,
  policy-agreement proof) — not ad hoc per incident.
