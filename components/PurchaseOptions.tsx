"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export default function PurchaseOptions({
  slug,
  subscription,
  oneTime,
}: {
  slug: string;
  subscription: number;
  oneTime: number;
}) {
  const [mode, setMode] = useState<"subscription" | "oneTime">("subscription");
  const { add } = useCart();

  return (
    <div className="mt-8">
      <button
        onClick={() => setMode("subscription")}
        className={`flex w-full items-start justify-between rounded-sm border p-5 text-left transition ${
          mode === "subscription"
            ? "border-ochre bg-white"
            : "border-ink/15 bg-transparent"
        }`}
      >
        <span>
          <span className="block text-[12px] uppercase tracking-[0.18em] text-ochre">
            The Ritual, Delivered
          </span>
          <span className="mt-1 block text-sm text-ink/70">
            Delivered every 45 days · pause or adjust anytime · member
            advantages reserved for subscribers
          </span>
        </span>
        <span className="font-serif text-2xl">${subscription}</span>
      </button>

      <button
        onClick={() => setMode("oneTime")}
        className={`mt-3 flex w-full items-center justify-between rounded-sm border p-3 text-left text-sm transition ${
          mode === "oneTime"
            ? "border-ink/40 bg-white"
            : "border-ink/10 text-ink/60"
        }`}
      >
        <span>Prefer a one-time purchase</span>
        <span className="font-serif text-lg">${oneTime}</span>
      </button>

      <button
        onClick={() => add(slug, mode)}
        className="mt-6 w-full bg-ink py-4 text-[12px] uppercase tracking-[0.25em] text-ivory transition hover:bg-ochre"
      >
        {mode === "subscription" ? "Begin the Ritual" : "Add to Bag"}
      </button>
      <p className="mt-3 text-center text-[11px] text-ink/50">
        Two complimentary samples with every order.
      </p>
    </div>
  );
}
