import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCartWithTotals, getOrCreateCart, type CartMode } from "@/lib/cart-server";

const VALID_MODES: CartMode[] = ["ninetyDay", "subscription", "oneTime"];

export async function GET() {
  const cart = await getCartWithTotals();
  return NextResponse.json(cart);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const slug = body?.slug;
  const mode = body?.mode;

  if (typeof slug !== "string" || !VALID_MODES.includes(mode)) {
    return NextResponse.json(
      { error: "slug and a valid mode are required" },
      { status: 400 }
    );
  }

  const product = await db.product.findUnique({ where: { slug } });
  if (!product) {
    return NextResponse.json({ error: "Unknown product" }, { status: 404 });
  }

  const cart = await getOrCreateCart();

  const existing = await db.cartItem.findUnique({
    where: { cartId_productSlug: { cartId: cart.id, productSlug: slug } },
  });

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { mode, qty: existing.qty + 1 },
    });
  } else {
    await db.cartItem.create({
      data: { cartId: cart.id, productSlug: slug, mode, qty: 1 },
    });
  }

  const updated = await getCartWithTotals();
  return NextResponse.json(updated, { status: 201 });
}
