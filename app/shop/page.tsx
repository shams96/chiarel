import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export const metadata = { title: "Shop", alternates: { canonical: "/shop" } };

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="eyebrow">Consumer Collection™</p>
      <h1 className="mt-2 font-serif text-4xl">Shop</h1>
      <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
