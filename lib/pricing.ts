// Single source of truth for the cart pricing rule, shared by the client
// (lib/cart-context.tsx, pricing a product before it's in the cart) and the
// server (lib/cart-server.ts, pricing an actual cart line from the DB). The
// two used to hand-duplicate this exact rule with no shared import — a real
// business-logic risk, not just a data-shape one: the 90-day multiplier
// could change on one side and not the other with nothing to catch it.
import { isFounding100, founding100Pricing } from "./founding100";

export type CartMode = "ninetyDay" | "subscription" | "oneTime";

export function computeUnitPrice(
  priceSubscription: number,
  priceOneTime: number,
  mode: CartMode,
  slug?: string
): number {
  if (mode === "ninetyDay") {
    const ninetyDayTotal = priceSubscription * 2;
    // Founding 100 products (see lib/founding100.ts) apply a real 20% discount
    // at checkout instead of the flat 2x — this is what makes the sitewide
    // "90-day ritual, half price" banner's claim actually true wherever it's
    // shown, rather than only on the dedicated /founding-100 page.
    return slug && isFounding100(slug) ? founding100Pricing(ninetyDayTotal).checkoutTotal : ninetyDayTotal;
  }
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
