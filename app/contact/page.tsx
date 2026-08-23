import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, ORDERS_EMAIL, PRESS_EMAIL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with CHIAREL™ — general inquiries, order support, and press contact.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-4xl leading-tight">Contact</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/70">
        CHIAREL™ is a small house — every message reaches a real person, not
        a queue.
      </p>

      <dl className="mt-12 space-y-8 text-sm leading-relaxed text-ink/80">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
            General Inquiries
          </dt>
          <dd className="mt-2">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="border-b border-ochre pb-0.5 text-ochre"
            >
              {CONTACT_EMAIL}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
            Order Support
          </dt>
          <dd className="mt-2 max-w-md">
            For questions about an existing order, subscription, or return,
            include your order number.{" "}
            <a
              href={`mailto:${ORDERS_EMAIL}`}
              className="border-b border-ochre pb-0.5 text-ochre"
            >
              {ORDERS_EMAIL}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
            Press
          </dt>
          <dd className="mt-2 max-w-md">
            For interview requests or brand assets, see the{" "}
            <Link href="/press" className="border-b border-ochre text-ochre">
              Press Kit
            </Link>{" "}
            or write to{" "}
            <a
              href={`mailto:${PRESS_EMAIL}`}
              className="border-b border-ochre pb-0.5 text-ochre"
            >
              {PRESS_EMAIL}
            </a>
            .
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
            Formulation &amp; Manufacturing
          </dt>
          <dd className="mt-2 max-w-md">
            CHIAREL™ is formulated in Isola del Liri, Italy, with
            manufacturing partner Natural You Srl.{" "}
            <Link href="/house" className="border-b border-ochre text-ochre">
              More on the House
            </Link>
            .
          </dd>
        </div>
      </dl>

      <p className="mt-16 max-w-xl text-[12px] leading-relaxed text-ink/50">
        CHIAREL™ is operated by 1HubSolutions, LLC. See our{" "}
        <Link href="/privacy" className="border-b border-ink/30 text-ink/60">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="border-b border-ink/30 text-ink/60">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
