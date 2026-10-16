import { MAX_LINE_QTY } from "@/lib/cart-limits";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCartWithTotals, getOrCreateCart, type CartMode } from "@/lib/cart-server";
import { withApiErrorHandling } from "@/lib/api-error";

const VALID_MODES: CartMode[] = ["ninetyDay", "subscription", "oneTime"];

async function assertOwnedByCurrentCart(itemId: string) {
  const cart = await getOrCreateCart();
  const item = await db.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.cartId !== cart.id) return null;
  return { cart, item };
}

export const PATCH = withApiErrorHandling(async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const body = await req.json().catch(() => null);
  const qty = body?.qty;
  const mode = body?.mode;

  // Either change the plan (idempotent: setting the plan the line already has
  // is a no-op) or the quantity. Plan changes never touch quantity.
  if (mode !== undefined) {
    if (!VALID_MODES.includes(mode)) {
      return NextResponse.json({ error: "invalid mode" }, { status: 400 });
    }
    const owned = await assertOwnedByCurrentCart(itemId);
    if (!owned) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    await db.cartItem.update({ where: { id: itemId }, data: { mode } });
    return NextResponse.json(await getCartWithTotals(owned.cart));
  }

  if (typeof qty !== "number" || qty < 1 || qty > MAX_LINE_QTY || !Number.isInteger(qty)) {
    return NextResponse.json(
      { error: "qty must be a whole number from 1 to 10" },
      { status: 400 }
    );
  }

  const owned = await assertOwnedByCurrentCart(itemId);
  if (!owned) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await db.cartItem.update({ where: { id: itemId }, data: { qty } });
  return NextResponse.json(await getCartWithTotals(owned.cart));
});

export const DELETE = withApiErrorHandling(async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const owned = await assertOwnedByCurrentCart(itemId);
  if (!owned) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await db.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json(await getCartWithTotals(owned.cart));
});
