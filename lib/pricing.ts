// Single source of truth for the cart pricing rule, shared by the client
// (lib/cart-context.tsx, pricing a product before it's in the cart) and the
// server (lib/cart-server.ts, pricing an actual cart line from the DB). The
// two used to hand-duplicate this exact rule with no shared import — a real
// business-logic risk, not just a data-shape one: the 90-day multiplier
// could change on one side and not the other with nothing to catch it.
export type CartMode = "ninetyDay" | "subscription" | "oneTime";

export function computeUnitPrice(
  priceSubscription: number,
  priceOneTime: number,
  mode: CartMode
): number {
  if (mode === "ninetyDay") return priceSubscription * 2;
  return mode === "subscription" ? priceSubscription : priceOneTime;
}

/** Per-line savings vs. paying one-time for the same quantity and mode. */
export function computeLineSavings(
  priceOneTime: number,
  unitPrice: number,
  mode: CartMode,
  qty: number
): number {
  const oneTimeEquivalent = mode === "ninetyDay" ? priceOneTime * 2 : priceOneTime;
  return (oneTimeEquivalent - unitPrice) * qty;
}
