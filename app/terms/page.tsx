import type { Metadata } from "next";
import { CONTACT_EMAIL, ORDERS_EMAIL, SITE_NAME } from "@/lib/seo";
import RefundPolicyContent, { REFUND_POLICY_VERSION } from "@/components/RefundPolicyContent";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing purchases and use of the CHIAREL™ website.",
  alternates: { canonical: "/terms" },
};

const EFFECTIVE_DATE = REFUND_POLICY_VERSION;

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-4xl leading-tight">Terms of Service</h1>
      <p className="mt-3 text-[12px] uppercase tracking-[0.16em] text-ink/65">
        Effective {EFFECTIVE_DATE}
      </p>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-ink/75">
        <section>
          <h2 className="font-serif text-xl text-ink">Orders &amp; pricing</h2>
          <p className="mt-3">
            All prices are charged in USD and are current at the time of
            purchase, regardless of your shipping destination. Any price
            shown in another currency at checkout is an approximate,
            informational conversion only — the amount actually charged to
            your card is the USD amount shown. Each CHIAREL™ product is made
            to order in small batches; by placing an order, you agree to the
            price and product shown at checkout. We reserve the right to
            correct pricing errors before an order ships.
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

        <RefundPolicyContent />

        <section>
          <h2 className="font-serif text-xl text-ink">
            Your Right to Cancel (EU Customers)
          </h2>
          <p className="mt-3">
            If you are a consumer in the European Union, you have the right
            to withdraw from your order within 14 days of delivery, without
            giving any reason, under EU Directive 2011/83/EU. To exercise
            this right, contact{" "}
            <a
              href={`mailto:${ORDERS_EMAIL}`}
              className="border-b border-ochre pb-0.5 text-ochre"
            >
              {ORDERS_EMAIL}
            </a>{" "}
            within that window and we will process your withdrawal.
          </p>
          <p className="mt-3">
            This right does not apply to sealed goods that have been unsealed
            after delivery and are not suitable for return for health
            protection or hygiene reasons — this includes CHIAREL™ products
            once their seal has been broken. It remains available for
            unopened, unused products within the 14-day window. This
            exception is separate from, and does not reduce, the 90-Day
            Guarantee above, which applies regardless of seal status.
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
            LLC, without regard to conflict-of-law principles. If you are a
            consumer resident in the European Union, the United Kingdom, or
            another jurisdiction with mandatory consumer-protection laws,
            nothing in these terms limits the protections those laws give
            you, and this governing-law clause does not deprive you of them.
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
