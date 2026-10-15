// Single source of truth for shipping and bonus-sample thresholds. Used by the
// checkout API (what is actually charged), the checkout page, the cart drawer
// and the cart page (estimates), so they cannot drift apart.
export const FREE_SHIP_THRESHOLD = 150;
export const SHIPPING_COST = 12;
export const EXTRA_SAMPLE_THRESHOLD = 250;

/** Shipping charge for a bag subtotal. An empty bag costs nothing. */
export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_COST;
}
