import AccountSubscriptions from "@/components/AccountSubscriptions";

export const metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <p className="eyebrow">Account</p>
      <h1 className="mt-2 font-serif text-4xl">Your Ritual</h1>
      <p className="mt-5 text-sm leading-relaxed text-ink/70">
        Subscription management arrives with the CHIAREL™ boutique on
        Shopify — pause, skip, or cancel your ritual with no customer
        service required. Preview the experience below.
      </p>

      <AccountSubscriptions />

      <p className="mt-10 text-center text-[11px] text-ink/45">
        This is a preview of the subscription management experience. No
        deliveries, pauses, or cancellations shown here are real.
      </p>
    </div>
  );
}
