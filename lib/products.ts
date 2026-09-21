import data from "@/data/products.json";

export type Product = {
  slug: string;
  sku: string;
  name: string;
  descriptor: string;
  step: string;
  ritualOrder: number | null;
  family: string;
  color: { name: string; hex: string };
  complex: string;
  line: string;
  size: string;
  // Optional, not required: a product can have an owner-approved price on
  // record (see CHIAREL_LAUNCH_PRICING_UPDATE.md) without yet being
  // purchasable — see `hidePriceUntilApproved` below. Every render site that
  // shows or acts on price uses `isPurchasable()`, never raw presence of
  // `price`, so a priced-but-not-yet-displayable product still renders a
  // "Price to be announced" state instead of a number.
  price?: { subscription: number; oneTime: number };
  image: string;
  blurb: string;
  role?: string;
  badge?: string;
  set?: boolean;
  includes?: string[];
  icon: boolean;
  actives?: { name: string; percent: string | null }[];
  benefits?: string[];
  // Four-product launch fields (added alongside the legacy fields above,
  // which are left untouched for every existing product — see
  // CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md §5).
  launchRitual?: boolean;
  launchRitualOrder?: number | null;
  launchRole?:
    | "hero"
    | "preparation"
    | "day-foundation"
    | "night-treatment"
    | "deferred"
    | "standalone"
    | "legacy-set";
  timeOfUse?: "AM" | "PM" | "AM/PM" | "standalone";
  launchStatus?: "launch" | "deferred" | "legacy";
  productColorToken?: string;
  /** True only for N1 today — its `image` is a labeled placeholder graphic, not real photography. */
  imageIsPlaceholder?: boolean;
  /**
   * True when a real, owner-approved price exists on `price` but must not
   * yet be shown or made purchasable — e.g. N1's price is approved but
   * withheld pending final formula, package size, image, availability, and
   * claims approval (see CHIAREL_LAUNCH_PRICING_UPDATE.md). Distinct from
   * `price` being absent entirely: this flag is the single source of truth
   * for "is this actually launch-ready to sell," not just "does a number
   * exist." Every render/purchase site checks `isPurchasable()`, not `price`.
   */
  hidePriceUntilApproved?: boolean;
};

export const products = data as Product[];

export const ritualProducts = products
  .filter((p) => p.ritualOrder !== null)
  .sort((a, b) => (a.ritualOrder as number) - (b.ritualOrder as number));

/**
 * The focused four-product launch ritual (CHIAREL Essence, Terra Radiance
 * Crème, Recovery Masque, N1) — distinct from the legacy `ritualProducts`
 * array above, which stays exactly as it was for any surface not yet
 * migrated to the launch structure (e.g. CartDrawer's upsell). Deliberately
 * a separate selector rather than a mutation of `ritualProducts`, so no
 * existing consumer's behavior changes by adding this.
 */
export const launchRitualProducts = products
  .filter((p) => p.launchRitual === true)
  .sort((a, b) => (a.launchRitualOrder ?? 0) - (b.launchRitualOrder ?? 0));

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);

/** Accessible alt text that discloses placeholder imagery instead of presenting it as real product photography. */
export function productImageAlt(p: Product): string {
  return p.imageIsPlaceholder
    ? `${p.name} — product image placeholder, final photography pending`
    : p.name;
}

/**
 * The single source of truth for "can this product be shown priced and sold
 * right now" — true only when a price exists AND it hasn't been explicitly
 * withheld via `hidePriceUntilApproved`. Also a type predicate, so
 * TypeScript narrows `price` to non-optional wherever this gates a branch,
 * without a non-null assertion at every call site.
 */
export function isPurchasable(
  p: Product
): p is Product & { price: NonNullable<Product["price"]> } {
  return p.price != null && !p.hidePriceUntilApproved;
}

/**
 * For call sites that only make sense with a known-good, hardcoded slug
 * (e.g. the homepage's featured products) — throws a descriptive error
 * instead of allowing `undefined` through. If a slug is ever renamed in
 * data/products.json without updating every caller, this turns that into a
 * traceable build/runtime error instead of a silent `undefined.price` crash.
 */
export function getProductOrThrow(slug: string): Product {
  const product = getProduct(slug);
  if (!product) {
    throw new Error(`getProductOrThrow: no product found for slug "${slug}"`);
  }
  return product;
}
