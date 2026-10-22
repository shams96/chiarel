import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withApiErrorHandling } from "@/lib/api-error";
import { filterCatalogItems } from "@/lib/cart-catalog-filter";

export const dynamic = "force-dynamic";

export const GET = withApiErrorHandling(async () => {
  // Removed products keep their database rows (orders reference them) but are not exposed.
  const products = filterCatalogItems(
    await db.product.findMany({ orderBy: { ritualOrder: "asc" } }),
    (p) => p.slug
  );

  const shaped = products.map((p) => ({
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    descriptor: p.descriptor,
    step: p.step,
    ritualOrder: p.ritualOrder,
    family: p.family,
    color: { name: p.colorName, hex: p.colorHex },
    complex: p.complex,
    line: p.line,
    size: p.size,
    price: { subscription: p.priceSub, oneTime: p.priceOneTime },
    image: p.image,
    blurb: p.blurb,
    role: p.role ?? undefined,
    badge: p.badge ?? undefined,
    set: p.isSet,
    icon: p.isIcon,
    actives: p.actives ? JSON.parse(p.actives as string) : undefined,
  }));

  return NextResponse.json(shaped);
});
