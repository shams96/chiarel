import type { Metadata } from "next";
import Link from "next/link";
import ComingSoonPackshot from "@/components/ComingSoonPackshot";
import { getProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "The Founding 100",
  description:
    "Join the first 100 members of the CHIAREL 90-Day Ritual. Half price at checkout, and a full refund when you share your honest result.",
  alternates: { canonical: "/founding-100" },
};

export default function Founding100Page() {
  const masque = getProduct("recovery-masque")!;
  const ninetyDaySubscriptionTotal = masque.price.subscription * 2;
  const ninetyDayOneTimeTotal = masque.price.oneTime * 2;
  const circleCheckoutTotal = Math.round(ninetyDaySubscriptionTotal * 0.8);
  const circleCredit = Math.round(circleCheckoutTotal * 0.25);
  const circleNet = circleCheckoutTotal - circleCredit;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="eyebrow">The House Opens</p>
      <h1 className="mt-2 font-serif text-4xl leading-tight">
        The Founding 100
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75">
        Half the price. Then none of it. We are opening the House to its
        first hundred — not as a discount, but as an invitation to trust
        us first, and be repaid for it. The ritual asks for ninety days; we
        ask you to give it that long.
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
              members receive the 90-Day Recovery Ritual — two consecutive
              deliveries of Recovery Masque™, 45 days apart — at 50% off at
              checkout: ${masque.price.subscription} instead of $
              {ninetyDaySubscriptionTotal}.
            </li>
            <li>
              <strong className="text-ink">2. Live with it.</strong> Use the
              ritual as intended across the full 90 days. Document your
              experience — a short video of your routine, and honest
              before-and-after photos.
            </li>
            <li>
              <strong className="text-ink">3. Share it.</strong> Submit
              within 30 days of your second delivery.
            </li>
            <li>
              <strong className="text-ink">4. We return the rest.</strong>{" "}
              Once approved, we refund the remaining balance in full — net
              free for ninety days. Prefer to keep going? Convert that value
              to credit toward your next 90-day cycle instead.
            </li>
          </ol>
        </div>

        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">The CHIAREL Circle™</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">
            The House doesn&rsquo;t close after a hundred. The next chapter
            is the CHIAREL Circle™ — open to the next 750 members, or for
            six months from today, whichever comes first.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">
            Circle members begin the 90-Day Ritual at{" "}
            <strong className="text-ink">20% off</strong> the subscription
            rate — ${circleCheckoutTotal} instead of $
            {ninetyDaySubscriptionTotal}. Complete it — live with the ritual
            for the full ninety days, and share one honest video and
            before-and-after set — and we credit back{" "}
            <strong className="text-ink">25% of what you paid</strong>{" "}
            (${circleCredit}), bringing your ninety days to ${circleNet}. Stay
            on, and continue at the standard Circle subscription rate for as
            long as you remain a member.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">
            This is not a standing discount. It is earned, once, by
            finishing what you start.
          </p>
        </div>

        <div className="border-l-2 border-ink/20 pl-6">
          <h2 className="font-serif text-2xl">Terms</h2>
          <ul className="mt-3 max-w-xl list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-ink/60">
            <li>
              <strong className="text-ink/80">Founding 100.</strong> Limited
              to the first 100 qualifying orders. Qualifying purchase: the
              90-Day Recovery Ritual (two consecutive 45-day subscription
              shipments of Recovery Masque™), at 50% off the standard
              subscription price, charged at checkout. To receive a full
              refund of the remaining balance, members must submit one
              routine video and one set of honest before-and-after
              photographs within 30 days of the second shipment&rsquo;s
              delivery date. Submissions are reviewed for authenticity and
              completeness, not for outcome; a positive result is not
              required. Approved members may elect a refund to their
              original payment method (issued within 10 business days) or a
              credit of equal value toward their next 90-day cycle. Limit
              one qualifying enrollment per household.
            </li>
            <li>
              <strong className="text-ink/80">CHIAREL Circle™.</strong> Open
              to new subscribers after the Founding 100 is filled, until the
              earlier of 750 enrollments or six (6) months from the
              Circle&rsquo;s launch date (&ldquo;the enrollment
              window&rdquo;). After the enrollment window closes, new
              subscribers receive CHIAREL&rsquo;s then-standard subscription
              pricing; existing Circle members&rsquo; benefits for their
              current cycle are unaffected. Qualifying purchase: the 90-Day
              Recovery Ritual at 20% off the standard subscription price.
              Members who submit one honest video and one set of
              before-and-after photographs within 30 days of their second
              shipment&rsquo;s delivery date receive a credit equal to 25%
              of the amount paid for that cycle, issued to their original
              payment method or as account credit, at the member&rsquo;s
              election. This credit is available once, on a member&rsquo;s
              first completed 90-day cycle. Subsequent cycles continue at
              the Circle&rsquo;s standard subscription rate, without
              additional content-based credit, for as long as the member
              remains subscribed.
            </li>
            <li>
              <strong className="text-ink/80">Content rights.</strong> By
              submitting a video, photograph, testimonial, name, or handle
              under either program, you grant CHIAREL (a division of
              1HubSolutions, LLC) a perpetual, irrevocable, royalty-free,
              worldwide license to use, reproduce, edit, and display that
              content across CHIAREL&rsquo;s website, social channels,
              packaging, and marketing materials, with attribution at
              CHIAREL&rsquo;s discretion. You retain ownership of your
              original content; this grant does not transfer copyright.
            </li>
            <li>
              <strong className="text-ink/80">Disclosure.</strong> All
              content submitted under either program must be an honest
              account of the member&rsquo;s experience — a positive review
              is never required, only a truthful one. Where compensation (a
              refund or credit) is received in exchange for content, members
              must disclose the material connection in accordance with FTC
              endorsement guidance (e.g. &ldquo;#CHIARELPartner&rdquo; or
              equivalent plain-language disclosure).
            </li>
            <li>
              Founding 100™ and CHIAREL Circle™ are provisional program
              names pending trademark clearance. One qualifying enrollment
              per household across both programs combined. CHIAREL reserves
              the right to verify submissions, and to modify or end either
              program&rsquo;s enrollment window at its discretion; changes
              will not affect members already enrolled under their original
              terms.
            </li>
          </ul>
        </div>
      </section>

      <div className="mt-14 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/shop/recovery-masque" className="border-b border-ochre pb-0.5 text-ochre">
          Begin the 90-Day Ritual
        </Link>
        <Link href="/science" className="border-b border-ink/30 pb-0.5 text-ink/60">
          The Science
        </Link>
      </div>
    </div>
  );
}
