import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCartWithTotals, getOrCreateCart } from "@/lib/cart-server";
import { stripe } from "@/lib/stripe";
import { withApiErrorHandling } from "@/lib/api-error";
import { getCountry } from "@/lib/countries";

const FREE_SHIP_THRESHOLD = 150;
// Keep in sync with EXTRA_SAMPLE_THRESHOLD in components/CartDrawer.tsx.
const EXTRA_SAMPLE_THRESHOLD = 250;

const modeLabel: Record<string, string> = {
  ninetyDay: "The Ritual Plan · 90-day supply, one delivery",
  subscription: "Subscription · every 45 days",
  oneTime: "One-time purchase",
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  const { email, firstName, lastName, address, city, country, state, zip, termsAccepted, termsVersion } =
    body ?? {};

  const selectedCountry = getCountry(country);
  if (!selectedCountry || !selectedCountry.enabled) {
    return NextResponse.json({ error: "Unsupported country" }, { status: 400 });
  }

  const required: Record<string, unknown> = { email, firstName, lastName, address, city, country };
  if (selectedCountry.requiresState) required.state = state;
  const missing = Object.entries(required).filter(([, v]) => !isNonEmptyString(v));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required field(s): ${missing.map(([k]) => k).join(", ")}` },
      { status: 400 }
    );
  }
  if (!isNonEmptyString(zip)) {
    return NextResponse.json({ error: "Missing required field(s): zip" }, { status: 400 });
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  // Server-side enforcement, not just a disabled submit button — a disabled
  // client-side control is a UX nicety, not the actual control. See
  // claudedocs/specs/dispute-risk-mitigation/PLAN.md item 2.
  if (termsAccepted !== true || !isNonEmptyString(termsVersion)) {
    return NextResponse.json(
      { error: "You must agree to the Refund Policy and Terms of Service to continue." },
      { status: 400 }
    );
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
      country,
      state: selectedCountry.requiresState ? state : null,
      zip,
      subtotal: cart.subtotal,
      savings: cart.savings,
      shipping,
      total,
      bonusSample: cart.subtotal >= EXTRA_SAMPLE_THRESHOLD,
      status: "pending",
      termsAcceptedAt: new Date(),
      termsVersion,
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
      tax_behavior: "exclusive";
      product_data: { name: string; description?: string };
    };
    quantity: number;
  }> = cart.lines.map((line) => ({
    price_data: {
      currency: "usd",
      unit_amount: Math.round(line.unitPrice * 100),
      tax_behavior: "exclusive",
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
        tax_behavior: "exclusive",
        product_data: { name: "Shipping" },
      },
      quantity: 1,
    });
  }

  // A Stripe Customer with the collected shipping address, so Stripe Tax
  // (enabled below) has a jurisdiction to calculate against — automatic_tax
  // needs a known customer address, not just customer_email. See
  // claudedocs/specs/international-launch/PLAN.md §4. Tax only actually
  // calculates once this Stripe account is registered to collect in the
  // relevant jurisdiction — enabling this here makes the code ready, it
  // doesn't perform that registration.
  // De-dup by email instead of creating a new Stripe Customer on every
  // checkout attempt (including retries after a failed submission) — flagged
  // in QA (claudedocs/specs/international-launch/TASKS.md).
  const customerAddress = {
    line1: address,
    city,
    state: selectedCountry.requiresState ? state : undefined,
    postal_code: zip,
    country,
  };
  const existing = await stripe.customers.list({ email, limit: 1 });
  const customer = existing.data[0]
    ? await stripe.customers.update(existing.data[0].id, {
        name: `${firstName} ${lastName}`,
        address: customerAddress,
      })
    : await stripe.customers.create({
        email,
        name: `${firstName} ${lastName}`,
        address: customerAddress,
      });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer: customer.id,
    line_items: lineItems,
    automatic_tax: { enabled: true },
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
});
