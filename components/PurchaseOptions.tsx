"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { purchaseOptionSummary, perDayPrice } from "@/lib/pricing";
import { track } from "@/lib/analytics";

type Tier = "ninetyDay" | "single" | "oneTime";

/** Id the sticky bar watches: it appears only once this button has scrolled out of view. */
export const PURCHASE_CTA_ID = "purchase-cta";

// How the three options work, as implemented by the cart and checkout
// (lib/pricing.ts, app/api/checkout/route.ts) and stated in /terms:
//  - The Ritual Plan: ONE payment of 2x the subscription price, a 90-day
//    supply, ONE delivery.
//  - Subscription: the subscription price per delivery, renewing every 45
//    days until paused or cancelled.
//  - One-time: full price, one delivery.
// Savings shown are always against the one-time price for the same amount of
// product, computed by purchaseOptionSummary() from the same pricing code the
// cart uses.
export default function PurchaseOptions({
  slug,
  subscription,
  oneTime,
}: {
  slug: string;
  subscription: number;
  oneTime: number;
}) {
  const [tier, setTier] = useState<Tier>("ninetyDay");
  const chooseTier = (next: Tier) => {
    if (next !== tier) track("subscribe_toggle", { item_id: slug, plan: next });
    setTier(next);
  };
  const { add } = useCart();

  const summary = purchaseOptionSummary(slug, subscription, oneTime);

  // The single primary price: whatever is selected, labelled in plain words.
  const primary =
    tier === "ninetyDay"
      ? {
          price: summary.ritual.total,
          perDay: perDayPrice(summary.ritual.total, 90),
          label: "one payment · 90-day supply · one delivery",
          saving: summary.ritual.saving,
          savingNote: "vs. buying twice one-time",
        }
      : tier === "single"
        ? {
            price: summary.subscription.perDelivery,
            perDay: perDayPrice(summary.subscription.perDelivery),
            label: "per delivery · every 45 days",
            saving: summary.subscription.saving,
            savingNote: "per delivery vs. one-time",
          }
        : {
            price: summary.oneTime.price,
            perDay: perDayPrice(summary.oneTime.price),
            label: "one-time · single delivery",
            saving: 0,
            savingNote: "",
          };

  const optionClass = (selected: boolean) =>
    `btn-press flex w-full items-start justify-between gap-4 rounded-sm border px-4 py-2.5 text-left transition ${
      selected ? "border-ochre bg-white" : "border-ink/15 bg-transparent hover:border-ink/30"
    }`;

  return (
    <div>
      {/* One primary price for the selected option. aria-live so a screen
          reader hears the price change when the plan changes. */}
      <div aria-live="polite">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-serif text-4xl leading-none">${primary.perDay}</span>
          <span className="text-[13px] text-ink/70">a day</span>
        </p>
        <p className="mt-1.5 text-[13px] text-ink/70">
          ${primary.price} · {primary.label}
        </p>
        <p className="mt-1.5 min-h-[1.25rem] text-[13px] text-ochre">
          {primary.saving > 0
            ? `You save $${primary.saving} ${primary.savingNote}`
            : summary.subscription.saving > 0
              ? `Subscribe and save $${summary.subscription.saving} per delivery`
              : ""}
        </p>
      </div>

      {/* role="radiogroup"/"radio": a mutually exclusive choice; aria-checked
          carries the same state sighted users get from the ochre border. */}
      <div role="radiogroup" aria-label="Purchase plan" className="mt-4 space-y-2">
        <button
          type="button"
          role="radio"
          aria-checked={tier === "ninetyDay"}
          onClick={() => chooseTier("ninetyDay")}
          className={optionClass(tier === "ninetyDay")}
        >
          <span className="min-w-0">
            <span className="block text-[12px] uppercase tracking-[0.16em] text-ochre">
              The Ritual Plan
            </span>
            <span className="mt-0.5 block text-[13px] leading-snug text-ink/70">
              90-day supply, paid once, one delivery
            </span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block font-serif text-xl leading-tight">${summary.ritual.total}</span>
            {summary.ritual.saving > 0 && (
              <span className="block text-[11px] text-ochre">Save ${summary.ritual.saving}</span>
            )}
          </span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={tier === "single"}
          onClick={() => chooseTier("single")}
          className={optionClass(tier === "single")}
        >
          <span className="min-w-0">
            <span className="block text-[12px] uppercase tracking-[0.16em] text-ink/80">
              Subscribe &amp; save
            </span>
            <span className="mt-0.5 block text-[13px] leading-snug text-ink/70">
              Renews every 45 days
            </span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block font-serif text-xl leading-tight">
              ${summary.subscription.perDelivery}
              <span className="ml-1 font-sans text-[11px] text-ink/65">/ delivery</span>
            </span>
            {summary.subscription.saving > 0 && (
              <span className="block text-[11px] text-ochre">
                Save ${summary.subscription.saving} each
              </span>
            )}
          </span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={tier === "oneTime"}
          onClick={() => chooseTier("oneTime")}
          className={optionClass(tier === "oneTime")}
        >
          <span className="min-w-0">
            <span className="block text-[12px] uppercase tracking-[0.16em] text-ink/80">
              One-time purchase
            </span>
            <span className="mt-0.5 block text-[13px] leading-snug text-ink/70">
              Single delivery
            </span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block font-serif text-xl leading-tight">${summary.oneTime.price}</span>
          </span>
        </button>
      </div>

      <button
        id={PURCHASE_CTA_ID}
        type="button"
        onClick={() => add(slug, tier === "single" ? "subscription" : tier)}
        className="btn-press mt-3 w-full bg-ink py-4 text-[12px] uppercase tracking-[0.25em] text-ivory transition hover:bg-ochre"
      >
        {tier === "oneTime" ? "Add to Bag" : "Begin the Ritual"}
      </button>

      {/* Delivery and returns at the point of purchase. Every statement here
          is taken from /terms (Subscriptions, Shipping, The 90-Day Guarantee). */}
      <ul className="mt-4 space-y-2 text-[12px] leading-relaxed text-ink/70">
        <li>
          <span className="text-ink">Made to order</span> in Isola del Liri, Italy. Allow
          standard processing time before dispatch; shipping options and timing are shown at
          checkout.
        </li>
        <li>
          <Link href="/terms#guarantee" className="tap-area text-ink underline decoration-ink/30 hover:text-ochre">
            90-Day Guarantee
          </Link>{" "}
          on your first order: if you are not satisfied, we refund the product price in full. No
          need to return the product; shipping is non-refundable.
        </li>
        {tier === "single" && (
          <li>
            Subscriptions renew every 45 days at the subscription price until paused or
            cancelled. To change or cancel, contact us as described in the{" "}
            <Link href="/terms" className="tap-area underline decoration-ink/30 hover:text-ochre">
              terms
            </Link>
            .
          </li>
        )}
        <li>
          Complimentary samples with every order.{" "}
          <Link href="/terms" className="tap-area underline decoration-ink/30 hover:text-ochre">
            Full shipping &amp; returns policy
          </Link>
        </li>
      </ul>
      <p className="mt-3 text-[11px] text-ink/65">
        Formulated under pharmacist guidance at Natural You Srl, Isola del Liri.
      </p>
    </div>
  );
}
