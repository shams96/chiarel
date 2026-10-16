import { db } from "@/lib/db";
import { isStaging } from "@/lib/app-env";

// Every first add to the bag creates a Cart row, and nothing ever removed them:
// shoppers who leave, finished orders, and test runs all left rows behind. A
// cart is only reachable through its cookie, which lasts 90 days (middleware.ts),
// so these are safe to delete:
//  - carts with no items after a week (a visitor who added then removed, or a
//    cart emptied after a paid order);
//  - any cart older than the cookie lifetime plus a day, which no browser can
//    open any more.
// Orders do not reference carts, so no order is affected. Items go with their
// cart (onDelete: Cascade).
const DAY_MS = 24 * 60 * 60 * 1000;
export const EMPTY_CART_MAX_AGE_DAYS = 7;
export const ANY_CART_MAX_AGE_DAYS = 91;

export function staleCartWhere(now: Date) {
  const before = (days: number) => new Date(now.getTime() - days * DAY_MS);
  return {
    OR: [
      { items: { none: {} }, createdAt: { lt: before(EMPTY_CART_MAX_AGE_DAYS) } },
      { createdAt: { lt: before(ANY_CART_MAX_AGE_DAYS) } },
    ],
  };
}

export async function pruneStaleCarts(now = new Date()): Promise<number> {
  const { count } = await db.cart.deleteMany({ where: staleCartWhere(now) });
  return count;
}

const globalForPrune = globalThis as unknown as { chiarelCartPruneStarted?: boolean };

async function runPrune() {
  try {
    const n = await pruneStaleCarts();
    if (n > 0) console.log(`[cart-prune] removed ${n} stale carts`);
  } catch (err) {
    // A background clean-up must never take the process down.
    console.error("[cart-prune] failed:", err);
  }
}

// Started from instrumentation.ts after the server is up, like the dispute
// monitor: never awaited before the port binds, first run five minutes after
// boot so a deploy restart does not open database connections early.
export function startCartPruneSchedule(): void {
  if (isStaging()) return;
  if (globalForPrune.chiarelCartPruneStarted) return;
  globalForPrune.chiarelCartPruneStarted = true;
  setTimeout(runPrune, 5 * 60 * 1000);
  setInterval(runPrune, DAY_MS);
}
