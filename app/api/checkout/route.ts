import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCartWithTotals, getOrCreateCart } from "@/lib/cart-server";

const FREE_SHIP_THRESHOLD = 150;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { email, firstName, lastName, address, city, state, zip } = body ?? {};

  const required = { email, firstName, lastName, address, city, state, zip };
  const missing = Object.entries(required).filter(([, v]) => !isNonEmptyString(v));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required field(s): ${missing.map(([k]) => k).join(", ")}` },
      { status: 400 }
    );
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const cart = await getCartWithTotals();
  if (cart.lines.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const shipping =
    cart.subtotal >= FREE_SHIP_THRESHOLD ? 0 : 12;
  const total = cart.subtotal + shipping;

  const order = await db.order.create({
    data: {
      email,
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      subtotal: cart.subtotal,
      savings: cart.savings,
      shipping,
      total,
      status: "confirmed",
      items: {
        create: cart.lines.map((line) => ({
          productSlug: line.slug,
          mode: line.mode,
          qty: line.qty,
          unitPrice: line.unitPrice,
        })),
      },
    },
    include: { items: true },
  });

  const currentCart = await getOrCreateCart();
  await db.cartItem.deleteMany({ where: { cartId: currentCart.id } });

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}
