import data from "@/data/products.json";

// See claudedocs/specs/product-image-gallery/SPEC.md for the role/background
// rules: hero and ingredient are transparent PNGs on the shared frame;
// texture, application, and lifestyle are graded scene photography, no alpha.
export type ProductGalleryImage = {
  src: string;
  alt: string;
  role?: "hero" | "texture" | "application" | "lifestyle" | "ingredient" | "detail";
};

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
  /** Optional share-card image (og:image) when the hero is a single item, e.g. for sets. */
  og?: string;
  /**
   * Optional multi-image gallery. Absent for every product today — the PDP
   * falls back to a single-image gallery built from `image`/`imageIsPlaceholder`
   * (see ProductGallery's caller in app/shop/[slug]/page.tsx). Populate this
   * once real photography exists for a product; see SPEC.md's Out of scope
   * on why no product ships a fabricated `gallery` array.
   */
  gallery?: ProductGalleryImage[];
  blurb: string;
  role?: string;
  badge?: string;
  set?: boolean;
  includes?: string[];
  icon: boolean;
  // Key ingredient NAMES only. No percentages are stored or published
  // anywhere on the site (owner decision).
  actives?: { name: string }[];
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
  /**
   * EU Cosmetics Regulation 1223/2009 requires an EU-established Responsible
   * Person named on the label before a cosmetic can be placed on the EU
   * market. Left null/absent for every product until that's resolved — see
   * claudedocs/specs/international-launch/SPEC.md. Present so the PDP can
   * render it the moment there's a real answer, without inventing one now
   * (constitution: "honest gaps stay visible, not hidden").
   */
  euResponsiblePerson?: { name: string; address: string } | null;
  /**
   * Directions for use, one step per entry. Only present where every line is
   * already published elsewhere on the site (see `howToUseSource`); the PDP
   * renders its "How to use" section only when this exists.
   */
  howToUse?: string[];
  /** Repo path(s) the `howToUse` lines were taken from, for audit. Not rendered. */
  howToUseSource?: string;
  /**
   * Full ingredient (INCI) list: names only, in descending order of
   * concentration, taken from the "INCI Order (draft)" tab of the v2 formula
   * workbook. NEVER store or render percentages here.
   */
  ingredientsInci?: string[];
  /**
   * Publication gate for `ingredientsInci`. 'draft-v2' = chemist-review draft,
   * NOT shown anywhere on the site. The owner flips a product to 'final' only
   * after Grazia / the suppliers confirm the consumer INCI (peptide premix
   * carriers, CHIAREL accord fragrance allergen declaration, IFRA). Use
   * `publishedInci()` to read it so the gate cannot be bypassed.
   */
  ingredientsInciStatus?: InciStatus;
};

export type InciStatus = "draft-v2" | "final";

/** The full INCI list, but only once the owner has marked it 'final'. */
export function publishedInci(p: Pick<Product, "ingredientsInci" | "ingredientsInciStatus">): string[] | null {
  if (p.ingredientsInciStatus !== "final") return null;
  return p.ingredientsInci && p.ingredientsInci.length > 0 ? p.ingredientsInci : null;
}

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
