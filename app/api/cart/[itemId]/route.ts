import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCartWithTotals, getOrCreateCart } from "@/lib/cart-server";

async function assertOwnedByCurrentCart(itemId: string) {
  const cart = await getOrCreateCart();
  const item = await db.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.cartId !== cart.id) return null;
  return item;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const body = await req.json().catch(() => null);
  const qty = body?.qty;

  if (typeof qty !== "number" || qty < 1 || !Number.isInteger(qty)) {
    return NextResponse.json(
      { error: "qty must be a positive integer" },
      { status: 400 }
    );
  }

  const item = await assertOwnedByCurrentCart(itemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await db.cartItem.update({ where: { id: itemId }, data: { qty } });
  return NextResponse.json(await getCartWithTotals());
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const item = await assertOwnedByCurrentCart(itemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await db.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json(await getCartWithTotals());
}
