import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/seo";
import { SMS_CONSENT_TEXT } from "@/lib/sms-consent";

export const metadata: Metadata = {
  title: "SMS Terms",
  description: "How CHIAREL™ text-message updates work: consent, frequency, opting out.",
  alternates: { canonical: "/sms-terms" },
};

const EFFECTIVE_DATE = "November 14, 2026";

export default function SmsTermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-h1 leading-tight">SMS Terms</h1>
      <p className="mt-3 text-eyebrow uppercase text-ink">Effective {EFFECTIVE_DATE}</p>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-ink">
        <section>
          <span aria-hidden="true" className="mb-3 block h-px w-8 bg-ochre" />
          <h2 className="font-serif text-h4 text-ink">Status</h2>
          <p className="mt-3">
            CHIAREL does not send text messages yet. If you saved a mobile
            number on the Founding Members list and ticked the text-message
            box, we will use it only once we begin, and only for the messages
            described here.
          </p>
        </section>

        <section>
          <span aria-hidden="true" className="mb-3 block h-px w-8 bg-ochre" />
          <h2 className="font-serif text-h4 text-ink">What you agree to</h2>
          <p className="mt-3">{SMS_CONSENT_TEXT}</p>
          <p className="mt-3">
            Texts are available to US and Canadian mobile numbers. We keep a
            record of your consent: the wording shown, the date and time, your
            IP address and browser. You must be 13 or older.
          </p>
        </section>

        <section>
          <span aria-hidden="true" className="mb-3 block h-px w-8 bg-ochre" />
          <h2 className="font-serif text-h4 text-ink">Opting out and help</h2>
          <p className="mt-3">
            Reply STOP, QUIT, END, CANCEL or UNSUBSCRIBE to any message to opt
            out, or email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="border-b border-ochre pb-0.5 text-ochre">{CONTACT_EMAIL}</a>.
            Reply HELP for help. We stop texting you within 10 business days
            of any opt-out, and we do not send text messages before 8am or
            after 9pm your local time.
          </p>
        </section>

        <section>
          <span aria-hidden="true" className="mb-3 block h-px w-8 bg-ochre" />
          <h2 className="font-serif text-h4 text-ink">Your information</h2>
          <p className="mt-3">
            See our <Link href="/privacy" className="border-b border-ochre pb-0.5 text-ochre">Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
