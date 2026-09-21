import { ORDERS_EMAIL } from "@/lib/seo";

// Single source of truth for the refund/returns text, shared between the Terms
// page (app/terms/page.tsx) and the checkout consent gate
// (app/checkout/page.tsx). Extracted so the two can never drift out of sync —
// per Stripe's own dispute-prevention guidance, a bare link to the Terms page
// isn't reliable dispute evidence; the checkout page needs the actual policy
// text present, not just a pointer to it. See
// claudedocs/specs/dispute-risk-mitigation/.
//
// Bump this whenever the refund/returns terms below change — it's written to
// each order as termsVersion, so a dispute response can point to exactly what
// the customer agreed to at the time of their specific order.
export const REFUND_POLICY_VERSION = "September 5, 2026";

export default function RefundPolicyContent() {
  return (
    <>
      <section id="guarantee">
        <h2 className="font-serif text-xl text-ink">The 90-Day Guarantee</h2>
        <p className="mt-3">
          A customer&rsquo;s first CHIAREL™ order is covered by a 90-day
          guarantee. If you are not satisfied, contact{" "}
          <a href={`mailto:${ORDERS_EMAIL}`} className="border-b border-ochre pb-0.5 text-ochre">
            {ORDERS_EMAIL}
          </a>{" "}
          with your order number within 90 days of delivery, and we will
          refund the product price in full. Shipping is non-refundable, and
          there is no need to return the product. This guarantee applies once
          per customer, to a first order only; it does not extend to
          subsequent orders or subscription renewals, which are handled under
          Returns &amp; exchanges below.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-ink">Returns &amp; exchanges</h2>
        <p className="mt-3">
          If something arrives damaged, incorrect, or you are otherwise
          unsatisfied with an order the 90-Day Guarantee above does not cover,
          contact{" "}
          <a href={`mailto:${ORDERS_EMAIL}`} className="border-b border-ochre pb-0.5 text-ochre">
            {ORDERS_EMAIL}
          </a>{" "}
          with your order number and we will work with you directly on a
          resolution.
        </p>
      </section>
    </>
  );
}
