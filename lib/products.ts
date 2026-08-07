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
  icon: boolean;
};

export const products = data as Product[];

export const ritualProducts = products
  .filter((p) => p.ritualOrder !== null)
  .sort((a, b) => (a.ritualOrder as number) - (b.ritualOrder as number));

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);
