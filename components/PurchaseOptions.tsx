"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

type Tier = "ninetyDay" | "single" | "oneTime";

export default function PurchaseOptions({
  slug,
  subscription,
  oneTime,
  perDayCadenceDays,
}: {
  slug: string;
  subscription: number;
  oneTime: number;
  /** If set, shows the single-delivery subscription price framed as a cost-per-day over this many days. */
  perDayCadenceDays?: number;
}) {
  const [tier, setTier] = useState<Tier>("ninetyDay");
  const { add } = useCart();

  const ninetyDayTotal = subscription * 2;
  const mode: "subscription" | "oneTime" =
    tier === "oneTime" ? "oneTime" : "subscription";

  return (
    <div className="mt-8">
      <button
        onClick={() => setTier("ninetyDay")}
        className={`flex w-full items-start justify-between rounded-sm border p-5 text-left transition ${
          tier === "ninetyDay"
            ? "border-ochre bg-white"
            : "border-ink/15 bg-transparent"
        }`}
      >
        <span>
          <span className="block text-[12px] uppercase tracking-[0.18em] text-ochre">
            The 90-Day Ritual
          </span>
          <span className="mt-1 block text-sm text-ink/70">
            Two deliveries, 45 days apart · pause or adjust anytime · member
            advantages reserved for subscribers
          </span>
        </span>
        <span className="text-right">
          <span className="block font-serif text-2xl">${ninetyDayTotal}</span>
          <span className="block text-[11px] text-ink/45">
            ${(ninetyDayTotal / 90).toFixed(2)}/day
          </span>
        </span>
      </button>

      <button
        onClick={() => setTier("single")}
        className={`mt-3 flex w-full items-center justify-between rounded-sm border p-3 text-left text-sm transition ${
          tier === "single"
            ? "border-ink/40 bg-white"
            : "border-ink/10 text-ink/60"
        }`}
      >
        <span>Single delivery, every 45 days</span>
        <span className="text-right">
          <span className="font-serif text-lg">${subscription}</span>
          {perDayCadenceDays && (
            <span className="ml-1 text-[11px] text-ink/45">
              (${(subscription / perDayCadenceDays).toFixed(2)}/day)
            </span>
          )}
        </span>
      </button>

      <button
        onClick={() => setTier("oneTime")}
        className={`mt-3 flex w-full items-center justify-between rounded-sm border p-3 text-left text-sm transition ${
          tier === "oneTime"
            ? "border-ink/40 bg-white"
            : "border-ink/10 text-ink/60"
        }`}
      >
        <span>Prefer a one-time purchase</span>
        <span className="font-serif text-lg">${oneTime}</span>
      </button>

      <button
        onClick={() => add(slug, mode)}
        className="btn-press mt-6 w-full bg-ink py-4 text-[12px] uppercase tracking-[0.25em] text-ivory transition hover:bg-ochre"
      >
        {tier === "oneTime" ? "Add to Bag" : "Begin the Ritual"}
      </button>
      <p className="mt-3 text-center text-[11px] text-ink/50">
        Two complimentary samples with every order.
      </p>
      <p className="mt-1 text-center text-[11px] text-ink/40">
        Formulated under pharmacist guidance at Natural You Srl, Isola del
        Liri.
      </p>
    </div>
  );
}
