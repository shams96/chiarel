// Products currently enrolled in the Founding 100 program: 20% off the
// 90-day prepay ("Ritual Plan") at checkout, 25% of that discounted total
// credited back later (see app/founding-100/page.tsx for the full mechanic).
// A fixed, explicit slug list rather than a DB column or product-data field
// — this is a marketing-program enrollment decision, not core product data,
// matching how lib/countries.ts keeps its fixed list in code rather than
// a speculative always-on field. Add a slug here when a product joins the
// program; nothing else needs to change for it to take effect everywhere
// (cart, checkout, PDP purchase options).
export const FOUNDING_100_SLUGS: ReadonlySet<string> = new Set([
  "recovery-masque",
  "n1-neck-decollete",
]);

export function isFounding100(slug: string): boolean {
  return FOUNDING_100_SLUGS.has(slug);
}

/**
 * The actual Founding 100 math: 20% off a 90-day (2x subscription-price)
 * prepay at checkout, then 25% of that discounted total credited back
 * later. Previously only computed inline in app/founding-100/page.tsx for
 * Recovery Masque; extracted so every enrolled product computes it
 * identically instead of re-deriving the same formula.
 */
export function founding100Pricing(ninetyDayTotal: number) {
  const checkoutTotal = Math.round(ninetyDayTotal * 0.8);
  const credit = Math.round(checkoutTotal * 0.25);
  const netCost = checkoutTotal - credit;
  return { checkoutTotal, credit, netCost };
}

/**
 * Total credit owed across a cart/order's lines — the amount that belongs in
 * the Order.founding100Credit ledger field. `subscriptionPriceFor` looks up
 * a line's real (undiscounted) subscription price by slug; kept as an
 * injected function rather than importing lib/products.ts directly, so this
 * stays a pure, easily testable function.
 */
export function totalFounding100Credit(
  lines: { slug: string; mode: string; qty: number }[],
  subscriptionPriceFor: (slug: string) => number
): number {
  return lines.reduce((sum, line) => {
    if (line.mode !== "ninetyDay" || !isFounding100(line.slug)) return sum;
    const flatNinetyDayTotal = subscriptionPriceFor(line.slug) * 2;
    return sum + founding100Pricing(flatNinetyDayTotal).credit * line.qty;
  }, 0);
}
