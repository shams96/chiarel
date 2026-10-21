// Single source of truth for shipping. Used by the checkout API (what is
// actually charged), the checkout page, the cart drawer and the cart page
// (estimates), so they cannot drift apart.
//
// Policy (owner decision): shipping is complimentary on every order. Every
// CHIAREL product is priced well above the usual free-shipping thresholds, and
// peers at this level (Tatcha, La Mer) do not charge postage. The function
// keeps its arguments so a future rule (a country surcharge, say) changes here
// and nowhere else.
//
// Samples are deliberately NOT part of this policy: nothing may promise or
// ship them until the ingredient declarations (INCI) and sample filling are
// settled.

type PlanLine = { mode: string };

/** True when the bag has a Ritual Plan or a subscription line. */
export function hasPlanLine(lines: PlanLine[]): boolean {
  return lines.some((l) => l.mode === "ninetyDay" || l.mode === "subscription");
}

/** Shipping charge for a bag: none. */
export function shippingFor(_subtotal: number, _lines: PlanLine[]): number {
  return 0;
}

/** The one-line shipping note shown in the drawer. */
export function shippingNote(_subtotal: number, _lines: PlanLine[]): string {
  return "Complimentary shipping on every order.";
}
