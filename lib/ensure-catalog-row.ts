import { db } from "@/lib/db";
import { getProduct, isPurchasable } from "@/lib/products";

// The production database is seeded by hand, so a product added to the catalog
// (data/products.json) can be missing its row, and then it 404s in the cart.
// This creates the row from the catalog the first time the product is added.
// It never touches an existing row (price in the database stays authoritative).
export async function ensureCatalogRow(slug: string) {
  const existing = await db.product.findUnique({ where: { slug } });
  if (existing) return existing;
  const p = getProduct(slug);
  if (!p || !isPurchasable(p) || !p.price) return null;
  return db.product.upsert({
    where: { slug },
    update: {},
    create: {
      slug: p.slug,
      sku: p.sku,
      name: p.name,
      descriptor: p.descriptor,
      step: p.step,
      ritualOrder: p.ritualOrder,
      family: p.family,
      colorName: p.color.name,
      colorHex: p.color.hex,
      complex: p.complex,
      line: p.line,
      size: p.size,
      priceSub: p.price.subscription,
      priceOneTime: p.price.oneTime,
      image: p.image,
      blurb: p.blurb,
      role: p.role ?? null,
      badge: p.badge ?? null,
      isSet: false,
      isIcon: p.icon,
      actives: p.actives ? JSON.stringify(p.actives) : undefined,
    },
  });
}
