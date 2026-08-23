import { cookies } from "next/headers";
import { db } from "@/lib/db";

const CART_COOKIE = "chiarel_cart_id";

export type CartMode = "ninetyDay" | "subscription" | "oneTime";

export function unitPriceFor(
  product: { priceSub: number; priceOneTime: number },
  mode: CartMode
): number {
  if (mode === "ninetyDay") return product.priceSub * 2;
  return mode === "subscription" ? product.priceSub : product.priceOneTime;
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

export async function getCartWithTotals() {
  const cart = await getOrCreateCart();
  const items = await db.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true },
    orderBy: { id: "asc" },
  });

  let subtotal = 0;
  let savings = 0;

  const lines = items.map((item) => {
    const unit = unitPriceFor(item.product, item.mode as CartMode);
    const oneTimeEquivalent =
      item.mode === "ninetyDay"
        ? item.product.priceOneTime * 2
        : item.product.priceOneTime;
    subtotal += unit * item.qty;
    savings += (oneTimeEquivalent - unit) * item.qty;

    return {
      id: item.id,
      slug: item.productSlug,
      mode: item.mode as CartMode,
      qty: item.qty,
      unitPrice: unit,
      product: {
        name: item.product.name,
        image: item.product.image,
        descriptor: item.product.descriptor,
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
