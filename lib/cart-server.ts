import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { computeUnitPrice, computeLineSavings, type CartMode } from "@/lib/pricing";
import { getProduct } from "@/lib/products";
import { filterCatalogItems } from "@/lib/cart-catalog-filter";

export type { CartMode };

const CART_COOKIE = "chiarel_cart_id";

export function unitPriceFor(
  product: { slug: string; priceSub: number; priceOneTime: number },
  mode: CartMode
): number {
  return computeUnitPrice(product.priceSub, product.priceOneTime, mode, product.slug);
}

/** Reads the cart-id cookie set by middleware and ensures a Cart row exists for it. */
export async function getOrCreateCart() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE)?.value;

  if (!cartId) {
    // Middleware should have set this on every request; fall back defensively.
    return db.cart.create({ data: {} });
  }

  const existing = await db.cart.findUnique({ where: { id: cartId } });
  if (existing) return existing;

  return db.cart.create({ data: { id: cartId } });
}

/** The visitor's existing cart, or null. Never creates a row: reads must not write. */
export async function getCartIfExists() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE)?.value;
  if (!cartId) return null;
  return db.cart.findUnique({ where: { id: cartId } });
}

/**
 * The cart with computed totals. Pass the cart a write route already loaded to
 * skip a repeat lookup (each database round trip costs about 0.4 s on the
 * production host). With no argument it only reads: a visitor with no cart gets
 * an empty one and no row is created.
 */
export async function getCartWithTotals(knownCart?: { id: string }) {
  const cart = knownCart ?? (await getCartIfExists());
  if (!cart) {
    return { cartId: null as string | null, lines: [], count: 0, subtotal: 0, savings: 0 };
  }
  // Lines for products that left the catalog stay in the database but are
  // dropped here, so they are never shown, totalled or checked out.
  const items = filterCatalogItems(
    await db.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: true },
      orderBy: { id: "asc" },
    }),
    (i) => i.productSlug
  );

  let subtotal = 0;
  let savings = 0;

  const lines = items.map((item) => {
    const unit = unitPriceFor(item.product, item.mode as CartMode);
    subtotal += unit * item.qty;
    savings += computeLineSavings(item.product.priceOneTime, unit, item.mode as CartMode, item.qty);

    return {
      id: item.id,
      slug: item.productSlug,
      mode: item.mode as CartMode,
      qty: item.qty,
      unitPrice: unit,
      // Display fields come from the catalog files, like every other page; the
      // database rows can hold stale image paths (two 404s on the live bag).
      // Prices still come from the database row.
      product: {
        name: getProduct(item.productSlug)?.name ?? item.product.name,
        image: getProduct(item.productSlug)?.image ?? item.product.image,
        descriptor: getProduct(item.productSlug)?.descriptor ?? item.product.descriptor,
      },
    };
  });

  return {
    cartId: cart.id,
    lines,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal,
    savings,
  };
}
