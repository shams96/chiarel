import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export const metadata = { title: "Shop", alternates: { canonical: "/shop" } };

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-serif text-4xl">Shop</h1>
      <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-ink/40">
        Consumer Collection™
      </p>
      <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
