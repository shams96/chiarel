"use client";

import { useCart } from "@/lib/cart-context";

// "Add to bag" for a paired product, on the routine/regimen cards. Adds the
// subscription plan (the price the card advertises); the plan can be changed
// in the bag.
export default function AddPairButton({ slug, name }: { slug: string; name: string }) {
  const { add } = useCart();
  return (
    <button
      type="button"
      onClick={() => add(slug, "subscription")}
      aria-label={`Add ${name} to bag`}
      className="btn-press min-h-[44px] w-full border border-ink/20 px-3 py-2 text-[12px] uppercase tracking-[0.16em] text-ink/80 transition hover:border-ochre hover:text-ochre sm:w-auto"
    >
      Add to bag
    </button>
  );
}
