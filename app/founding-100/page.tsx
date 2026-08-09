import type { Metadata } from "next";
import Link from "next/link";
import ComingSoonPackshot from "@/components/ComingSoonPackshot";
import { getProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "The Founding 100 — CHIAREL™",
  description:
    "Join the first 100 members of CHIAREL. Half price at checkout, and a full refund when you share your honest result.",
  alternates: { canonical: "/founding-100" },
};

export default function Founding100Page() {
  const masque = getProduct("recovery-masque")!;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="eyebrow">The House Opens</p>
      <h1 className="mt-2 font-serif text-4xl leading-tight">
        The Founding 100
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75">
        Half the price. Then none of it. We are opening the House to its
        first hundred — not as a discount, but as an invitation to trust
        us first, and be repaid for it.
      </p>

      <div className="mt-12 max-w-sm">
        <ComingSoonPackshot productName={masque.name} color={masque.color.hex} />
      </div>

      <section className="mt-16 space-y-10">
        <div className="border-l-2 border-ochre pl-6">
          <h2 className="font-serif text-2xl">How it works</h2>
          <ol className="mt-3 max-w-xl space-y-3 text-sm leading-relaxed text-ink/75">
            <li>
              <strong className="text-ink">1. Join.</strong> The first 100
              members to sign up receive Recovery Masque™ at 50% off at
              checkout.
            </li>
            <li>
              <strong className="text-ink">2. Live with it.</strong> Use the
              ritual as intended, and document your experience — a short
              video of your routine, and honest before-and-after photos.
            </li>
            <li>
              <strong className="text-ink">3. Share it.</strong> Submit
              within 30 days of delivery.
            </li>
            <li>
              <strong className="text-ink">4. We repay you.</strong> Once
              approved, we refund the remaining balance in full. Not a
              discount anymore — a gift, earned by trust.
            </li>
          </ol>
        </div>

        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">The CHIAREL Circle™</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">
            The House doesn&rsquo;t close after a hundred — the terms simply
            become a standing promise. Members who join after the Founding
            100 receive <strong className="text-ink">50% off for a full
            year</strong> of their ritual. Share an honest review within 30
            days of any delivery, and receive{" "}
            <strong className="text-ink">50% cash back</strong> on that
            order.
          </p>
        </div>

        <div className="border-l-2 border-ink/20 pl-6">
          <h2 className="font-serif text-2xl">Terms</h2>
          <ul className="mt-3 max-w-xl list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-ink/60">
            <li>
              Founding 100: 50% off at checkout on the qualifying product.
              Submit one short video + before/after photos within 30 days
              of delivery to receive a full refund of the remaining
              balance.
            </li>
            <li>
              The CHIAREL Circle™: 50% off for 12 months from enrollment.
              Submit one written or video review within 30 days of any
              delivery to receive 50% cash back on that specific order.
            </li>
            <li>
              All rewarded reviews and videos must disclose the
              relationship (e.g. &ldquo;#CHIARELPartner&rdquo; or
              equivalent) in accordance with FTC endorsement guidance.
              Content must be honest and reflect your genuine experience —
              we do not require a positive review, only an honest one.
            </li>
            <li>
              Refunds are issued to the original payment method within 10
              business days of approval. One qualifying submission per
              household. CHIAREL reserves the right to verify submissions
              before issuing a refund.
            </li>
            <li>
              Founding 100™ and The CHIAREL Circle™ are provisional program
              names pending trademark clearance.
            </li>
          </ul>
        </div>
      </section>

      <div className="mt-14 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/shop/recovery-masque" className="border-b border-ochre pb-0.5 text-ochre">
          Shop Recovery Masque™
        </Link>
        <Link href="/science" className="border-b border-ink/30 pb-0.5 text-ink/60">
          The Science
        </Link>
      </div>
    </div>
  );
}
