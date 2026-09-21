# Dispute/Chargeback Risk Mitigation — Tasks

Ordered per PLAN.md's sequencing (1→2→3→6, then 5, then 4 — mail helper before the
monitor that calls it).

1. **Schema**: extend `Order` with `termsAcceptedAt`, `termsVersion`, `stripeChargeId`, `disputeId`, `disputeStatus`, `disputeReason`, `disputeAmount`, `disputeOpenedAt`, `disputeClosedAt`. Push via `prisma db push` (additive — same non-destructive approach as admin-rbac, not `migrate dev`, given the known migration-history drift).
2. **Shared terms/refund content**: extract the refund-relevant sections from `app/terms/page.tsx` into a constant both the Terms page and checkout import, so they can't drift.
3. **Checkout consent gate**: `<details>` block + required checkbox on `app/checkout/page.tsx`; server-side rejection in `app/api/checkout/route.ts` if consent isn't `true`; write `termsAcceptedAt`/`termsVersion` on order creation.
4. **Dispute webhook handlers**: extend `app/api/webhooks/stripe/route.ts` with `charge.dispute.created` and `charge.dispute.closed`, matching the existing idempotency pattern.
5. **`lib/mail.ts`**: nodemailer wrapper using Hostinger SMTP env vars; add those vars to `.env.example`.
6. **`lib/dispute-monitoring.ts`**: the Visa/Mastercard ratio calculator + warning-tier logic.
7. **Wire the daily check**: an in-process scheduled task, started after `app.listen()`, that runs the monitor and emails via `lib/mail.ts` when the tier crosses `approaching`.
8. **`DISPUTE_RESPONSE_RUNBOOK.md`**: the SOP artifact (no code).
9. **Verify**: lint, typecheck; manually simulate a `charge.dispute.created` webhook event (Stripe CLI or a crafted signed payload) against the dev server and confirm the order record updates; confirm checkout genuinely rejects a request missing consent.
