import ResponsiveImage from "@/components/ResponsiveImage";
import Link from "next/link";
import { productImageAlt, isPurchasable, studioImage, type Product, productHref } from "@/lib/products";
import { perDayPrice } from "@/lib/pricing";
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
    <Link href={productHref(product.slug)} className="btn-press group block">
      <div
        className="product-frame aspect-[4/5]"
        style={{ backgroundColor: NEUTRAL_FRAME_BG }}
      >
        <ResponsiveImage
          src={studioImage(product)}
          alt={productImageAlt(product)}
          sizes="(max-width: 768px) 100vw, 33vw"
          className={productHoverClass(product.step)}
        />
        {product.badge && (
          <span className="absolute left-3 top-3 bg-ivory/90 px-2.5 py-1 text-[12px] uppercase tracking-[0.18em] text-ochre">
            {product.badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="font-serif text-xl">{product.name}</h3>
        <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-ink/65">
          {product.step}
        </p>
        <p className="mt-1 text-[13px] text-ink/60">{product.descriptor}</p>
        {!hidePrice && (
          <p className="mt-2 text-sm">
            {isPurchasable(product) ? (
              <>
                <span className="tabular-nums font-medium">
                  From ${perDayPrice(product.price.subscription)} a day
                </span>
                <span className="mt-0.5 block text-[12px] text-ink/65">
                  ${product.price.subscription} with subscription · $
                  {product.price.oneTime} one-time
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
