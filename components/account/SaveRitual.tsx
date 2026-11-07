"use client";

import CodeLogin from "@/components/account/CodeLogin";

// Offered on the order confirmation: the order's own email is already filled in,
// so saving the ritual is one tap, then the code. Past orders on that address
// attach on verification. Optional; the order is complete without it.
export default function SaveRitual({ email }: { email: string }) {
  return (
    <section aria-labelledby="save-ritual" className="mx-auto mt-10 max-w-sm border border-ink/15 p-6 text-left">
      <h2 id="save-ritual" className="font-serif text-2xl">
        Save your ritual
      </h2>
      <p className="mt-2 mb-5 text-[14px] leading-relaxed text-ink">
        See this order and reorder in one place. We will send a code to {email}.
      </p>
      <CodeLogin compact initialEmail={email} cta="Save your ritual" returnTo="/account" />
    </section>
  );
}
