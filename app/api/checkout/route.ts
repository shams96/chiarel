import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCartWithTotals, getOrCreateCart } from "@/lib/cart-server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { withApiErrorHandling } from "@/lib/api-error";
import { getCountry } from "@/lib/countries";
import { totalFounding100Credit } from "@/lib/founding100";
import { getProductOrThrow } from "@/lib/products";
import { isRateLimited, clientIp } from "@/lib/rate-limit";

const FREE_SHIP_THRESHOLD = 150;
// Keep in sync with EXTRA_SAMPLE_THRESHOLD in components/CartDrawer.tsx.
const EXTRA_SAMPLE_THRESHOLD = 250;
// Throttle by IP: checkout creates a pending Order row and a Stripe Checkout
// Session on every call, so an unthrottled endpoint is a cheap way to spam
// both the DB and the Stripe account — not a customer-facing limit anyone
// placing real orders would ever hit.
const CHECKOUT_MAX_ATTEMPTS = 20;
const CHECKOUT_WINDOW_MS = 10 * 60 * 1000;

const modeLabel: Record<string, string> = {
  ninetyDay: "The Ritual Plan · 90-day supply, one delivery",
  subscription: "Subscription · every 45 days",
  oneTime: "One-time purchase",
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  if (isRateLimited(`checkout:${clientIp(req)}`, CHECKOUT_MAX_ATTEMPTS, CHECKOUT_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      { status: 429 }
    );
  }

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
  const founding100Credit = totalFounding100Credit(
    cart.lines,
    (slug) => getProductOrThrow(slug).price!.subscription
  );

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
      founding100Credit: founding100Credit > 0 ? founding100Credit : null,
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

  // automatic_tax needs the Stripe account itself to have a registered head
  // office address (Dashboard → Tax settings) — an account-level setup step,
  // not something this code can perform. Until that's done, Stripe rejects
  // EVERY session creation with automatic_tax enabled (verified live during
  // QA: "You must have a valid head office address to enable automatic tax
  // calculation in test mode"), which would otherwise take down checkout
  // entirely for all customers. Fall back to a session without automatic
  // tax rather than hard-failing the purchase — no tax is collected in that
  // fallback path, same as before automatic_tax was added (see
  // claudedocs/specs/international-launch/SPEC.md's prior no-tax baseline).
  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer: customer.id,
      line_items: lineItems,
      automatic_tax: { enabled: true },
      success_url: `${origin}/order/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: { orderId: order.id },
    });
  } catch (err) {
    // Stripe doesn't expose a stable error code for this specific
    // misconfiguration (verified against the SDK's error types) — narrowing
    // on StripeInvalidRequestError + the known message substring is the best
    // available check. If Stripe ever changes this message's wording, this
    // stops matching and checkout reverts to hard-failing loudly (safer than
    // silently swallowing an unrelated error) rather than to fail silently.
    const isKnownTaxConfigError =
      err instanceof Stripe.errors.StripeInvalidRequestError &&
      err.message.includes("head office address");
    if (!isKnownTaxConfigError) throw err;
    const message = err.message;
    console.error(
      "[checkout] automatic_tax rejected by Stripe account config — falling back to no-tax session. Fix: set a head office address at https://dashboard.stripe.com/test/settings/tax",
      message
    );
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer: customer.id,
      line_items: lineItems,
      success_url: `${origin}/order/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: { orderId: order.id },
    });
  }

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
