import Image from "next/image";
import Link from "next/link";
import { productImageAlt, isPurchasable, type Product } from "@/lib/products";
import { NEUTRAL_FRAME_BG } from "@/lib/color";
import { productHoverClass } from "@/lib/motion";

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
        style={{ backgroundColor: NEUTRAL_FRAME_BG }}
      >
        <Image
          src={product.image}
          alt={productImageAlt(product)}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={productHoverClass(product.step)}
        />
        {product.badge && (
          <span className="absolute left-3 top-3 bg-ivory/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-ochre">
            {product.badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="font-serif text-xl">{product.name}</h3>
        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink/65">
          {product.step}
        </p>
        <p className="mt-1 text-[13px] text-ink/60">{product.descriptor}</p>
        {!hidePrice && (
          <p className="mt-2 text-sm">
            {isPurchasable(product) ? (
              <>
                <span className="tabular-nums font-medium">
                  ${product.price.subscription}
                </span>
                <span className="ml-1 text-[12px] text-ink/65">
                  with subscription · ${product.price.oneTime} one-time
                </span>
              </>
            ) : (
              <span className="text-[12px] uppercase tracking-[0.14em] text-ink/65">
                Price to be announced
              </span>
            )}
          </p>
        )}
      </div>
    </Link>
  );
}
