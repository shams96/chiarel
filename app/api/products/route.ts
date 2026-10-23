import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withApiErrorHandling } from "@/lib/api-error";
import { getProduct } from "@/lib/products";
import { filterCatalogItems } from "@/lib/cart-catalog-filter";

export const dynamic = "force-dynamic";

export const GET = withApiErrorHandling(async () => {
  // Removed products keep their database rows (orders reference them) but are not exposed.
  const products = filterCatalogItems(
    await db.product.findMany({ orderBy: { ritualOrder: "asc" } }),
    (p) => p.slug
  );

  // Display fields come from the catalog (data/products.json) so a stale
  // database row can never show an old name, colour or blurb; the database
  // stays the source of truth for price (the cart and checkout read it).
  const shaped = products.map((p) => {
    const c = getProduct(p.slug);
    return {
      slug: p.slug,
      sku: p.sku,
      name: c?.name ?? p.name,
      descriptor: c?.descriptor ?? p.descriptor,
      step: c?.step ?? p.step,
      ritualOrder: c?.ritualOrder ?? p.ritualOrder,
      family: c?.family ?? p.family,
      color: c?.color ?? { name: p.colorName, hex: p.colorHex },
      size: c?.size ?? p.size,
      price: { subscription: p.priceSub, oneTime: p.priceOneTime },
      image: c?.image ?? p.image,
      blurb: c?.blurb ?? p.blurb,
      role: c?.role ?? p.role ?? undefined,
      badge: c?.badge ?? p.badge ?? undefined,
      icon: c?.icon ?? p.isIcon,
      actives: c?.actives ?? (p.actives ? JSON.parse(p.actives as string) : undefined),
    };
  });

  return NextResponse.json(shaped);
});
