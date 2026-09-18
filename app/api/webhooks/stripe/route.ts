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
        // already marked paid. Also records the PaymentIntent id, which is
        // how a later dispute event (below) gets matched back to this order.
        await db.order.updateMany({
          where: { id: orderId, status: "pending" },
          data: {
            status: "paid",
            stripePaymentIntentId:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
          },
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

  // Dispute handling — see claudedocs/specs/dispute-risk-mitigation/. This does
  // NOT submit evidence programmatically (Stripe's Dashboard/Smart Disputes stays
  // the actual response mechanism, per that spec's explicit scope boundary); it
  // exists purely to make dispute state visible against the order record instead
  // of only living in the Stripe Dashboard, and to feed the daily rate monitor.
  if (event.type === "charge.dispute.created" || event.type === "charge.dispute.closed") {
    const dispute = event.data.object as Stripe.Dispute;
    const paymentIntentId =
      typeof dispute.payment_intent === "string" ? dispute.payment_intent : null;

    if (paymentIntentId) {
      try {
        const isClosed = event.type === "charge.dispute.closed";
        await db.order.updateMany({
          where: { stripePaymentIntentId: paymentIntentId },
          data: {
            disputeId: dispute.id,
            disputeStatus: dispute.status,
            disputeReason: dispute.reason,
            disputeAmount: dispute.amount,
            // Use Stripe's own event timestamp, not `new Date()` — a redelivered
            // event must not shift these dates on retry.
            ...(isClosed
              ? { disputeClosedAt: new Date(event.created * 1000) }
              : { disputeOpenedAt: new Date(dispute.created * 1000) }),
          },
        });
      } catch (err) {
        console.error("Failed to reconcile dispute from Stripe webhook:", err);
        return NextResponse.json({ error: "Reconciliation failed" }, { status: 500 });
      }
    } else {
      console.error(`Dispute ${dispute.id} has no payment_intent — cannot match to an order`);
    }
  }

  return NextResponse.json({ received: true });
}
