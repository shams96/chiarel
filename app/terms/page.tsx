import type { Metadata } from "next";
import { CONTACT_EMAIL, ORDERS_EMAIL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing purchases and use of the CHIAREL™ website.",
  alternates: { canonical: "/terms" },
};

const EFFECTIVE_DATE = "September 5, 2026";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-4xl leading-tight">Terms of Service</h1>
      <p className="mt-3 text-[12px] uppercase tracking-[0.16em] text-ink/50">
        Effective {EFFECTIVE_DATE}
      </p>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-ink/75">
        <section>
          <h2 className="font-serif text-xl text-ink">Orders &amp; pricing</h2>
          <p className="mt-3">
            All prices are listed in USD and are current at the time of
            purchase. Each CHIAREL™ product is made to order in small
            batches; by placing an order, you agree to the price and product
            shown at checkout. We reserve the right to correct pricing errors
            before an order ships.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Payment</h2>
          <p className="mt-3">
            Payment is processed securely by Stripe. Your order is confirmed
            once payment is successfully captured; you will receive an
            email receipt.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Subscriptions</h2>
          <p className="mt-3">
            Choosing subscription pricing sets a recurring delivery on a
            45-day cadence at the discounted rate. Self-service subscription
            management (pause, skip, cancel) is being built into the account
            experience; until it launches, contact{" "}
            <a
              href={`mailto:${ORDERS_EMAIL}`}
              className="border-b border-ochre pb-0.5 text-ochre"
            >
              {ORDERS_EMAIL}
            </a>{" "}
            to modify or cancel a subscription, and we will process the
            request promptly.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Shipping</h2>
          <p className="mt-3">
            Because each order is formulated and produced to order in Isola
            del Liri, Italy, please allow standard processing time before
            dispatch. Shipping timelines and destinations available at
            checkout may change without notice.
          </p>
        </section>

        <section id="guarantee">
          <h2 className="font-serif text-xl text-ink">The 90-Day Guarantee</h2>
          <p className="mt-3">
            A customer&rsquo;s first CHIAREL™ order is covered by a 90-day
            guarantee. If you are not satisfied, contact{" "}
            <a
              href={`mailto:${ORDERS_EMAIL}`}
              className="border-b border-ochre pb-0.5 text-ochre"
            >
              {ORDERS_EMAIL}
            </a>{" "}
            with your order number within 90 days of delivery, and we will
            refund the product price in full. Shipping is non-refundable, and
            there is no need to return the product. This guarantee applies
            once per customer, to a first order only; it does not extend to
            subsequent orders or subscription renewals, which are handled
            under Returns &amp; exchanges below.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Returns &amp; exchanges</h2>
          <p className="mt-3">
            If something arrives damaged, incorrect, or you are otherwise
            unsatisfied with an order the 90-Day Guarantee above does not
            cover, contact{" "}
            <a
              href={`mailto:${ORDERS_EMAIL}`}
              className="border-b border-ochre pb-0.5 text-ochre"
            >
              {ORDERS_EMAIL}
            </a>{" "}
            with your order number and we will work with you directly on a
            resolution.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Intellectual property</h2>
          <p className="mt-3">
            {SITE_NAME}, its formulation names, and all site content are the
            property of 1HubSolutions, LLC or its licensors, and may not be
            reproduced without permission.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Limitation of liability</h2>
          <p className="mt-3">
            Products are intended for cosmetic use as described on each
            product page. Statements on this site have not been evaluated by
            the FDA, and CHIAREL™ products are not intended to diagnose,
            treat, cure, or prevent any disease. To the fullest extent
            permitted by law, 1HubSolutions, LLC is not liable for indirect
            or consequential damages arising from use of this site or its
            products.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Governing law</h2>
          <p className="mt-3">
            These terms are governed by the laws applicable to 1HubSolutions,
            LLC, without regard to conflict-of-law principles.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Contact</h2>
          <p className="mt-3">
            Questions about these terms can be sent to{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="border-b border-ochre pb-0.5 text-ochre"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
