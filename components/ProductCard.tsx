import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { productTint } from "@/lib/color";

export default function ProductCard({
  product,
  hidePrice,
}: {
  product: Product;
  hidePrice?: boolean;
}) {
  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div
        className="product-frame aspect-square"
        style={{ backgroundColor: productTint(product.color.hex) }}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="transition duration-700 group-hover:scale-[1.03]"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 bg-ivory/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-ochre">
            {product.badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="eyebrow">{product.step}</p>
        <h3 className="mt-1 font-serif text-xl">{product.name}</h3>
        <p className="text-[13px] text-ink/60">{product.descriptor}</p>
        {!hidePrice && (
          <p className="mt-2 text-sm">
            <span className="font-medium">${product.price.subscription}</span>
            <span className="ml-1 text-[12px] text-ink/50">
              with subscription · ${product.price.oneTime} one-time
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}
