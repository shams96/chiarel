import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCartWithTotals, getOrCreateCart, type CartMode } from "@/lib/cart-server";
import { withApiErrorHandling } from "@/lib/api-error";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { MAX_LINE_QTY } from "@/lib/cart-limits";
import { isCatalogSlug } from "@/lib/cart-catalog-filter";

const VALID_MODES: CartMode[] = ["ninetyDay", "subscription", "oneTime"];

export const GET = withApiErrorHandling(async () => {
  const cart = await getCartWithTotals();
  return NextResponse.json(cart);
});

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  // Every first add creates a cart row, so an unthrottled loop fills the table.
  // Far above what a shopper does (a few adds a minute).
  if (isRateLimited(`cart-add:${clientIp(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const slug = body?.slug;
  const mode = body?.mode;

  if (typeof slug !== "string" || !VALID_MODES.includes(mode)) {
    return NextResponse.json(
      { error: "slug and a valid mode are required" },
      { status: 400 }
    );
  }

  // Only catalog products can be added; database rows for removed products stay but are not sellable.
  const product = isCatalogSlug(slug) ? await db.product.findUnique({ where: { slug } }) : null;
  if (!product) {
    return NextResponse.json({ error: "Unknown product" }, { status: 404 });
  }

  const cart = await getOrCreateCart();

  const existing = await db.cartItem.findUnique({
    where: { cartId_productSlug: { cartId: cart.id, productSlug: slug } },
  });

  if (existing) {
    // Re-adding the same tier is a genuine "one more" — bump quantity.
    // Adding a different tier means the customer changed their mind about
    // which plan they want, not that they want a second unit at the new
    // tier's price, so only the mode updates and quantity is preserved.
    await db.cartItem.update({
      where: { id: existing.id },
      data:
        existing.mode === mode
          ? { qty: Math.min(existing.qty + 1, MAX_LINE_QTY) }
          : { mode },
    });
  } else {
    await db.cartItem.create({
      data: { cartId: cart.id, productSlug: slug, mode, qty: 1 },
    });
  }

  const updated = await getCartWithTotals(cart);
  return NextResponse.json(updated, { status: 201 });
});
