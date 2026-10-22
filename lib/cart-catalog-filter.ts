import { getProduct } from "@/lib/products";

// The catalog (data/products.json) is the only source of what can be sold.
// Database rows for products that left the catalog stay (orders reference them),
// but a bag that still holds one must never show it or check it out.

/** True when the slug is a product in the current catalog. */
export function isCatalogSlug(slug: unknown): slug is string {
  return typeof slug === "string" && getProduct(slug) !== undefined;
}

/** Keeps only lines whose slug is in the catalog; drops everything else. */
export function filterCatalogLines<L extends { slug: string }>(lines: L[]): L[] {
  return lines.filter((l) => isCatalogSlug(l.slug));
}

/** Keeps only items (e.g. database product rows) whose slug is in the catalog. */
export function filterCatalogItems<T>(items: T[], slugOf: (item: T) => string): T[] {
  return items.filter((i) => isCatalogSlug(slugOf(i)));
}
