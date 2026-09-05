import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

// Source of truth for order payment status. The order confirmation page
// (app/order/[id]/page.tsx) already re-verifies the session server-side on
// the customer's return redirect and is NOT spoofable — but a customer who
// closes the tab after paying never triggers that check, so the order stays
// "pending" forever with no reconciliation path. This webhook is what
// actually closes that gap, independent of whether the customer's browser
// ever comes back.
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId && session.payment_status === "paid") {
      try {
        // updateMany + status:"pending" guard makes this idempotent — Stripe
        // may deliver the same event more than once, and this must not
        // double-process an order the customer's own return-redirect
        // already marked paid.
        await db.order.updateMany({
          where: { id: orderId, status: "pending" },
          data: { status: "paid" },
        });
      } catch (err) {
        // Let this surface as a 500 (not caught/downgraded) so Stripe's
        // automatic retry has a chance to succeed once the DB recovers —
        // unlike customer-facing routes, a retry-worthy failure here should
        // NOT return a clean success-shaped response.
        console.error("Failed to reconcile order from Stripe webhook:", err);
        return NextResponse.json({ error: "Reconciliation failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
