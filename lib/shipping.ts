// Single source of truth for shipping and bonus-sample thresholds. Used by the
// checkout API (what is actually charged), the checkout page, the cart drawer
// and the cart page (estimates), so they cannot drift apart.
//
// Policy (set from peer research: Tatcha and Augustinus Bader ship
// subscriptions free, La Mer's standard shipping is complimentary, and a
// recurring plan that charged postage on every delivery would double the
// customer's delivery cost): the Ritual Plan (one 90-day delivery) and
// subscription lines ship free at any bag size. One-time bags pay a flat
// charge below the threshold. Change the numbers here and nowhere else.
export const FREE_SHIP_THRESHOLD = 150;
export const SHIPPING_COST = 12;
export const EXTRA_SAMPLE_THRESHOLD = 250;

type PlanLine = { mode: string };

/** True when the bag has a Ritual Plan or a subscription line. */
export function hasPlanLine(lines: PlanLine[]): boolean {
  return lines.some((l) => l.mode === "ninetyDay" || l.mode === "subscription");
}

/** Shipping charge for a bag. An empty bag costs nothing. */
export function shippingFor(subtotal: number, lines: PlanLine[]): number {
  if (subtotal <= 0) return 0;
  if (hasPlanLine(lines)) return 0;
  return subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_COST;
}

/**
 * The one-line shipping note shown in the drawer and on the bag page: what the
 * customer has unlocked, or how to unlock it (switch to a plan, or add more).
 */
export function shippingNote(subtotal: number, lines: PlanLine[]): string {
  if (shippingFor(subtotal, lines) === 0) return "Complimentary shipping included.";
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  return `Complimentary shipping with the Ritual Plan or a subscription, or add $${remaining} more.`;
}
