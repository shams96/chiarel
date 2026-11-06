// The one place plan names are written. The drawer, bag page, checkout, order
// page, product page and the Stripe line-item description all read from here, so
// a plan can never be called three different things in one purchase.
//
// Wording is unchanged from the copies this replaces. Whether "Subscription ·
// every 45 days" is true of what is charged is decision D1 (claudedocs/commerce/
// CHIAREL_IMPLEMENTATION_PLAN.md); changing it later is a one-line edit here.

export type PlanMode = "ninetyDay" | "subscription" | "oneTime";

/** Short name: a row label, a select option, an order line. */
export const PLAN_NAME: Record<PlanMode, string> = {
  ninetyDay: "90-day plan",
  subscription: "Subscription",
  oneTime: "One-time",
};

/** Name plus what happens: the drawer line and the Stripe line-item description. */
export const PLAN_DETAIL: Record<PlanMode, string> = {
  ninetyDay: "90-day plan · one delivery",
  subscription: "Subscription · every 45 days",
  oneTime: "One-time purchase",
};

/** The product page offers "single" for a subscription; the cart calls it subscription. */
export type Tier = "ninetyDay" | "single" | "oneTime";

/**
 * The buying funnel's vocabulary, one phrase per step, so no surface invents a
 * fourth (the audit found six phrasings for one funnel). Plan:
 * claudedocs/commerce/CHIAREL_IMPLEMENTATION_PLAN.md, Phase B.
 *   product page and sticky bar: "Begin the Ritual" (a plan) / "Add to Bag" (one-time)
 *   drawer and bag page:         "Checkout"
 *   checkout page:               "Complete Your Order"
 */
export const CTA = {
  begin: "Begin the Ritual",
  addOneTime: "Add to Bag",
  bag: "Checkout",
  pay: "Complete Your Order",
} as const;

/** The label on the product page button and on the sticky bar, for the chosen tier. */
export function addCtaLabel(tier: Tier): string {
  return tier === "oneTime" ? CTA.addOneTime : CTA.begin;
}

export function tierToMode(tier: Tier): PlanMode {
  return tier === "single" ? "subscription" : tier;
}

export function modeToTier(mode: PlanMode): Tier {
  return mode === "subscription" ? "single" : mode;
}
