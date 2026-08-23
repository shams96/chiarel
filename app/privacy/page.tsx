import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How CHIAREL™ collects, uses, and protects your information.",
  alternates: { canonical: "/privacy" },
};

const EFFECTIVE_DATE = "August 23, 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-4xl leading-tight">Privacy Policy</h1>
      <p className="mt-3 text-[12px] uppercase tracking-[0.16em] text-ink/50">
        Effective {EFFECTIVE_DATE}
      </p>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-ink/75">
        <section>
          <h2 className="font-serif text-xl text-ink">Information we collect</h2>
          <p className="mt-3">
            When you place an order, we collect your name, email address,
            shipping address, and order contents in order to fulfill it. When
            you join our founding list, we collect your name, email, and any
            phone or social handle you choose to provide. We do not collect
            or store your payment card details — those are handled entirely
            by our payment processor, Stripe (see below).
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Cookies</h2>
          <p className="mt-3">
            {SITE_NAME} uses a single first-party cookie to remember the
            contents of your shopping cart between visits. It is functional,
            not used for advertising or cross-site tracking. We do not
            currently use third-party analytics or advertising trackers on
            this site; if that changes, we will update this policy.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">How we use your information</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>To process and fulfill your order and manage subscriptions.</li>
            <li>To send order confirmations, receipts, and shipping updates.</li>
            <li>To respond to inquiries sent to us directly.</li>
            <li>To improve the products and site — never sold to third parties.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Third parties we work with</h2>
          <p className="mt-3">
            Payments are processed by Stripe, Inc., which receives and
            secures your card details directly — we never see or store full
            card numbers. Order and account data is stored in a hosted
            database used solely to operate this store. We do not sell your
            personal information to data brokers or advertisers.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Your rights</h2>
          <p className="mt-3">
            You may request a copy of the personal information we hold about
            you, ask us to correct it, or ask us to delete it, subject to
            what we&rsquo;re required to retain for order, tax, and legal
            records. To make a request, contact us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="border-b border-ochre pb-0.5 text-ochre"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Children&rsquo;s privacy</h2>
          <p className="mt-3">
            {SITE_NAME} is not directed at children, and we do not knowingly
            collect information from anyone under 16.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Changes to this policy</h2>
          <p className="mt-3">
            If this policy changes, we will update the effective date above
            and, for material changes, note it on this page.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Contact</h2>
          <p className="mt-3">
            Questions about this policy can be sent to{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="border-b border-ochre pb-0.5 text-ochre"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            or via our{" "}
            <Link href="/contact" className="border-b border-ochre text-ochre">
              Contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
