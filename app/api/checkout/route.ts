import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CUSTOMER_COOKIE, resolveCustomerSession } from "@/lib/customer-session";
import { db } from "@/lib/db";
import { getCartWithTotals, getOrCreateCart } from "@/lib/cart-server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { withApiErrorHandling } from "@/lib/api-error";
import { getCountry } from "@/lib/countries";
import { getProductOrThrow } from "@/lib/products";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { shippingFor } from "@/lib/shipping";
import { trustedOrigin } from "@/lib/site-origin";

// Throttle by IP: checkout creates a pending Order row and a Stripe Checkout
// Session on every call, so an unthrottled endpoint is a cheap way to spam
// both the DB and the Stripe account — not a customer-facing limit anyone
// placing real orders would ever hit.
const CHECKOUT_MAX_ATTEMPTS = 20;
const CHECKOUT_WINDOW_MS = 10 * 60 * 1000;

// How long a Stripe Checkout Session stays payable. Stripe allows 30 minutes to
// 24 hours; its default of 24 hours leaves a forgotten tab payable all day.
const SESSION_LIFETIME_MS = 45 * 60 * 1000;

const modeLabel: Record<string, string> = {
  ninetyDay: "90-day plan · one delivery",
  subscription: "Subscription · every 45 days",
  oneTime: "One-time purchase",
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

// Generous for real addresses; stops megabyte strings reaching the database and Stripe.
const MAX_FIELD_LENGTH = 200;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  if (selectedCountry.postalRequired && !isNonEmptyString(zip)) {
    return NextResponse.json({ error: "Missing required field(s): zip" }, { status: 400 });
  }
  if (zip != null && typeof zip !== "string") {
    return NextResponse.json({ error: "Invalid postal code" }, { status: 400 });
  }
  const postalCode = isNonEmptyString(zip) ? zip.trim() : "";
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const tooLong = [firstName, lastName, address, city, zip, state].some(
    (v) => typeof v === "string" && v.length > MAX_FIELD_LENGTH
  );
  if (tooLong) {
    return NextResponse.json({ error: "A field is too long" }, { status: 400 });
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

  const shipping = shippingFor(cart.subtotal, cart.lines);
  const total = cart.subtotal + shipping;
  const origin = trustedOrigin(req.headers.get("origin"), req.url);

  // The same unpaid checkout (same bag, same buyer details) reuses its open
  // Stripe session. Two tabs or a double click then land on one payable session
  // instead of two, so a customer cannot pay twice for one bag. Anything that
  // changed (a quantity, an address) hashes differently and starts fresh.
  const fingerprint = createHash("sha256")
    .update(
      JSON.stringify({
        email: String(email).trim().toLowerCase(),
        lines: cart.lines.map((l) => [l.slug, l.mode, l.qty, l.unitPrice]).sort(),
        total,
        address, city, country, state: state ?? null, zip: postalCode,
      }),
    )
    .digest("hex");
  const reusable = await db.order.findFirst({
    where: {
      checkoutFingerprint: fingerprint,
      status: "pending",
      stripeSessionId: { not: null },
      sessionExpiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (reusable?.stripeSessionId) {
    try {
      const open = await stripe.checkout.sessions.retrieve(reusable.stripeSessionId);
      if (open.status === "open" && open.url) {
        return NextResponse.json({ orderId: reusable.id, checkoutUrl: open.url }, { status: 200 });
      }
    } catch (err) {
      // Could not confirm the old session is still open: fall through to a new one.
      console.error("[checkout] could not reuse open session:", err);
    }
  }

  // Link the order to the signed-in customer, so it shows in their account
  // without waiting for the email-match at sign-in. A failed lookup just means
  // a guest order, as before.
  const signedIn = await resolveCustomerSession((await cookies()).get(CUSTOMER_COOKIE)?.value).catch(
    () => null,
  );
  const sessionExpiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);

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
      zip: postalCode,
      subtotal: cart.subtotal,
      savings: cart.savings,
      shipping,
      total,
      status: "pending",
      customerId: signedIn?.customer.id ?? null,
      checkoutFingerprint: fingerprint,
      sessionExpiresAt,
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
    postal_code: postalCode || undefined,
    country,
  };
  // Reuse a customer only when this address is the one already on file. The
  // email is typed by whoever fills the form, so never overwrite an existing
  // customer's name or address with it: someone else's email would let a
  // stranger rewrite that customer's saved details.
  const existing = await stripe.customers.list({ email, limit: 10 });
  const sameAddress = existing.data.find(
    (c) =>
      c.address?.line1 === customerAddress.line1 &&
      c.address?.postal_code === customerAddress.postal_code &&
      c.address?.country === customerAddress.country
  );
  const customer =
    sameAddress ??
    (await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`,
      address: customerAddress,
    }));

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
  // Shared by both attempts below. expires_at bounds how long a stale tab can
  // still be paid; the PaymentIntent metadata is what lets a payment_failed
  // event find its order; the idempotency key makes a retried request return
  // the same session instead of opening another.
  const sessionBase = {
    mode: "payment" as const,
    payment_method_types: ["card" as const],
    customer: customer.id,
    line_items: lineItems,
    success_url: `${origin}/order/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
    metadata: { orderId: order.id },
    payment_intent_data: { metadata: { orderId: order.id } },
    expires_at: Math.floor(sessionExpiresAt.getTime() / 1000),
  };
  let session;
  try {
    session = await stripe.checkout.sessions.create(
      { ...sessionBase, automatic_tax: { enabled: true } },
      { idempotencyKey: `checkout-session-${order.id}` },
    );
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
    // Stable [alert] prefix so a log search or alert rule can find every order
    // that was charged without tax.
    console.error(
      `[alert] checkout.no_tax_fallback order=${order.id} — automatic_tax rejected by Stripe account config, charging without tax. Fix: set a head office address at https://dashboard.stripe.com/test/settings/tax`,
      message
    );
    session = await stripe.checkout.sessions.create(sessionBase, {
      idempotencyKey: `checkout-session-notax-${order.id}`,
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
