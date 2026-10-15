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

export type PurchaseOptionSummary = {
  /** The Ritual Plan: one payment for a 90-day supply, one delivery. */
  ritual: { total: number; saving: number };
  /** Subscription: price per delivery, renewing every 45 days. */
  subscription: { perDelivery: number; saving: number };
  /** One-time purchase at full price. */
  oneTime: { price: number };
};

/**
 * Everything the PDP purchase box displays, derived from the same
 * computeUnitPrice / computeLineSavings the cart and server use, so what the
 * page advertises cannot drift from what the cart charges. Savings are
 * measured against the one-time price for the same amount of product: one
 * delivery for a subscription, two deliveries (the 90-day supply) for the
 * Ritual Plan. A saving is never negative.
 */
export function purchaseOptionSummary(
  slug: string,
  priceSubscription: number,
  priceOneTime: number
): PurchaseOptionSummary {
  const ritualTotal = computeUnitPrice(priceSubscription, priceOneTime, "ninetyDay", slug);
  return {
    ritual: {
      total: ritualTotal,
      saving: Math.max(0, computeLineSavings(priceOneTime, ritualTotal, "ninetyDay", 1)),
    },
    subscription: {
      perDelivery: priceSubscription,
      saving: Math.max(0, computeLineSavings(priceOneTime, priceSubscription, "subscription", 1)),
    },
    oneTime: { price: priceOneTime },
  };
}

/** Days of product one delivery covers; the subscription renews on this cadence. */
export const DELIVERY_DAYS = 45;

/**
 * Price per day of use, in dollars to the cent, for a price covering `days`
 * days. Display-only: derived from the same prices the cart charges, so the
 * headline per-day figure cannot drift from checkout.
 */
export function perDayPrice(price: number, days: number = DELIVERY_DAYS): string {
  return (Math.round((price / days) * 100) / 100).toFixed(2);
}
