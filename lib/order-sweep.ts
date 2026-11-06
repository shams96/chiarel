import { db } from "@/lib/db";
import { isStaging } from "@/lib/app-env";

// Abandoned checkouts. Every checkout creates a "pending" order and a Stripe
// Checkout Session that stops being payable after SESSION_LIFETIME (45 minutes,
// app/api/checkout/route.ts). Stripe tells us with `checkout.session.expired`,
// but only once the production webhook is subscribed to that event; until then
// (and if a delivery is ever missed) these orders would sit "pending" for ever
// and be counted as open. This sweep makes the status true on its own.
//
// It marks, it never deletes: the row keeps its items, buyer and totals for
// support and analytics, and a late `checkout.session.completed` can still pay
// an "expired" order (settleCheckoutSession pays from pending, failed, expired).
// The grace period leaves room for a payment made in the last minutes whose
// webhook is still in flight. (Plan, Phase A: "purge of stale pending orders".)
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
export const EXPIRE_GRACE_MINUTES = 60;
// Orders written before sessionExpiresAt existed carry no expiry; Stripe's own
// default session lifetime is 24 hours, so after 25 hours they cannot be paid.
export const LEGACY_PENDING_MAX_AGE_HOURS = 25;

export function stalePendingWhere(now: Date) {
  return {
    status: "pending",
    OR: [
      { sessionExpiresAt: { lt: new Date(now.getTime() - EXPIRE_GRACE_MINUTES * MINUTE_MS) } },
      { sessionExpiresAt: null, createdAt: { lt: new Date(now.getTime() - LEGACY_PENDING_MAX_AGE_HOURS * HOUR_MS) } },
    ],
  };
}

export async function expireStalePendingOrders(now = new Date()): Promise<number> {
  const { count } = await db.order.updateMany({
    where: stalePendingWhere(now),
    data: { status: "expired" },
  });
  return count;
}

const globalForSweep = globalThis as unknown as { chiarelOrderSweepStarted?: boolean };

async function runSweep() {
  try {
    const n = await expireStalePendingOrders();
    if (n > 0) console.log(`[order-sweep] expired ${n} abandoned pending orders`);
  } catch (err) {
    // A background clean-up must never take the process down.
    console.error("[order-sweep] failed:", err);
  }
}

// Started from instrumentation.ts after the server is up, like the cart prune
// and the dispute monitor: never awaited before the port binds, first run seven
// minutes after boot so a deploy restart does not open database connections
// early, then hourly.
export function startOrderSweepSchedule(): void {
  if (isStaging()) return;
  if (globalForSweep.chiarelOrderSweepStarted) return;
  globalForSweep.chiarelOrderSweepStarted = true;
  setTimeout(runSweep, 7 * MINUTE_MS);
  setInterval(runSweep, HOUR_MS);
}
