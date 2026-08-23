import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCartWithTotals, getOrCreateCart } from "@/lib/cart-server";
import { stripe } from "@/lib/stripe";

const FREE_SHIP_THRESHOLD = 150;

const modeLabel: Record<string, string> = {
  ninetyDay: "The Ritual Plan · 90-day supply, one delivery",
  subscription: "Subscription · every 45 days",
  oneTime: "One-time purchase",
};

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

  const shipping = cart.subtotal >= FREE_SHIP_THRESHOLD ? 0 : 12;
  const total = cart.subtotal + shipping;

  // Order is recorded as pending until Stripe confirms payment — the order
  // page verifies the session server-side and flips this to "paid" itself,
  // rather than trusting the client's return from a redirect.
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
      status: "pending",
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

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  const lineItems: Array<{
    price_data: {
      currency: string;
      unit_amount: number;
      product_data: { name: string; description?: string };
    };
    quantity: number;
  }> = cart.lines.map((line) => ({
    price_data: {
      currency: "usd",
      unit_amount: Math.round(line.unitPrice * 100),
      product_data: {
        name: line.product.name,
        description: modeLabel[line.mode] ?? line.mode,
      },
    },
    quantity: line.qty,
  }));

  if (shipping > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        unit_amount: shipping * 100,
        product_data: { name: "Shipping" },
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: lineItems,
    success_url: `${origin}/order/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
    metadata: { orderId: order.id },
  });

  await db.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start payment" }, { status: 502 });
  }

  // Cart stays intact until the order page confirms Stripe actually took
  // payment — clearing it here would empty a customer's bag even if they
  // cancel out of Stripe Checkout without paying.
  return NextResponse.json({ orderId: order.id, checkoutUrl: session.url }, { status: 201 });
}
