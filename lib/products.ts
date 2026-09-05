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
  price: { subscription: number; oneTime: number };
  image: string;
  blurb: string;
  role?: string;
  badge?: string;
  set?: boolean;
  includes?: string[];
  icon: boolean;
  actives?: { name: string; percent: string | null }[];
  benefits?: string[];
};

export const products = data as Product[];

export const ritualProducts = products
  .filter((p) => p.ritualOrder !== null)
  .sort((a, b) => (a.ritualOrder as number) - (b.ritualOrder as number));

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);

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
