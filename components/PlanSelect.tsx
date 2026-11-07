"use client";

import { useCart, type CartLine } from "@/lib/cart-context";
import { getProduct, isPurchasable } from "@/lib/products";
import { planOptions } from "@/lib/pricing";
import { PLAN_NAME } from "@/lib/plan-labels";

// Plan selector for one bag line, used by the drawer and the bag page so the two
// cannot offer different plans or prices. Switching keeps the quantity and does
// not open the drawer (changePlan, not add).
export default function PlanSelect({ line }: { line: CartLine }) {
  const { changePlan } = useCart();
  const product = getProduct(line.slug);
  if (!product || !isPurchasable(product)) {
    return <p className="text-[13px] text-ink">{PLAN_NAME[line.mode]}</p>;
  }
  const options = planOptions(line.slug, product.price.subscription, product.price.oneTime);
  return (
    <div>
      <label htmlFor={`plan-${line.id}`} className="sr-only">
        Plan for {line.product.name}
      </label>
      <select
        id={`plan-${line.id}`}
        value={line.mode}
        onChange={(e) => changePlan(line.slug, e.target.value as CartLine["mode"])}
        className="min-h-[44px] w-full cursor-pointer border border-ink/20 bg-white px-3 py-2 text-[13px] text-ink focus:border-ochre focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.mode} value={o.mode}>
            {o.label} · ${o.price}
          </option>
        ))}
      </select>
      <p className="mt-1.5 text-[12px] text-ink">
        {options.find((o) => o.mode === line.mode)?.detail}
      </p>
    </div>
  );
}
