import Link from "next/link";
import { ORDERS_EMAIL } from "@/lib/seo";

export const metadata = { title: "Account", robots: { index: false, follow: false } };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="font-serif text-4xl">Your Ritual</h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink/70">
        CHIAREL™ is a small house, and your ritual is looked after by a real
        person. To pause, skip, change, or cancel a subscription, write to us
        with your order number and we will see to it personally.
      </p>

      <div className="mt-10 border border-ink/15 p-6">
        <p className="text-[12px] uppercase tracking-[0.16em] text-ink/65">
          Subscription Care
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink/80">
          <a
            href={`mailto:${ORDERS_EMAIL}`}
            className="border-b border-ochre pb-0.5 text-ochre"
          >
            {ORDERS_EMAIL}
          </a>
        </p>
        <p className="mt-4 text-[13px] leading-relaxed text-ink/65">
          There is no commitment. Subscriptions renew every 45 days and can be
          adjusted whenever you ask.
        </p>
        <Link
          href="/contact"
          className="mt-5 inline-block text-[12px] uppercase tracking-[0.14em] text-ink underline underline-offset-4"
        >
          All contact details
        </Link>
      </div>
    </div>
  );
}
