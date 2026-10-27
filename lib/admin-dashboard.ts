// Aggregates for the admin dashboard. Counts and sums are computed in the
// database; no order rows or personal data are returned. Days are UTC.
import { db } from "@/lib/db";

const DAY = 24 * 60 * 60 * 1000;

export type Window = { orders: number; revenue: number; averageOrder: number };

export function shapeWindow(orders: number, revenue: number | null | undefined): Window {
  const r = revenue ?? 0;
  return { orders, revenue: r, averageOrder: orders > 0 ? Math.round((r / orders) * 100) / 100 : 0 };
}

export function paymentsMode(key: string | undefined): "test" | "live" | "unknown" {
  if (!key) return "unknown";
  if (key.startsWith("sk_test") || key.startsWith("rk_test")) return "test";
  if (key.startsWith("sk_live") || key.startsWith("rk_live")) return "live";
  return "unknown";
}

export async function getDashboard(now = new Date()) {
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const d7 = new Date(startOfToday.getTime() - 6 * DAY);
  const d30 = new Date(startOfToday.getTime() - 29 * DAY);

  // Revenue counts paid orders that were not cancelled (gross USD, before refunds and fees).
  const counted = { status: "paid", fulfilmentStatus: { not: "cancelled" } } as const;
  const win = async (since: Date) => {
    const r = await db.order.aggregate({
      where: { ...counted, createdAt: { gte: since } },
      _count: { _all: true },
      _sum: { total: true },
    });
    return shapeWindow(r._count._all, r._sum.total);
  };

  const [today, last7, last30, unfulfilled, packed, oldest, shipped30, openDisputes, credits, subsActive, subsNew, subsGone] =
    await Promise.all([
      win(startOfToday),
      win(d7),
      win(d30),
      db.order.count({ where: { status: "paid", fulfilmentStatus: "unfulfilled" } }),
      db.order.count({ where: { status: "paid", fulfilmentStatus: "packed" } }),
      db.order.findFirst({
        where: { status: "paid", fulfilmentStatus: "unfulfilled" },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
      db.order.count({ where: { shippedAt: { gte: d30 } } }),
      db.order.aggregate({
        where: { disputeId: { not: null }, disputeClosedAt: null },
        _count: { _all: true },
        _sum: { disputeAmount: true },
      }),
      db.order.aggregate({
        where: { founding100Credit: { not: null }, founding100CreditIssuedAt: null },
        _count: { _all: true },
        _sum: { founding100Credit: true },
      }),
      db.emailSubscriber.count({ where: { unsubscribedAt: null } }),
      db.emailSubscriber.count({ where: { createdAt: { gte: d30 } } }),
      db.emailSubscriber.count({ where: { unsubscribedAt: { gte: d30 } } }),
    ]);

  return {
    generatedAt: now.toISOString(),
    paymentsMode: paymentsMode(process.env.STRIPE_SECRET_KEY),
    sales: { today, last7, last30 },
    fulfilment: {
      toPack: unfulfilled,
      packedNotShipped: packed,
      oldestUnfulfilledDays: oldest ? Math.floor((now.getTime() - oldest.createdAt.getTime()) / DAY) : null,
      shippedLast30: shipped30,
    },
    disputes: { open: openDisputes._count._all, amount: openDisputes._sum.disputeAmount ?? 0 },
    credits: { owedCount: credits._count._all, owedAmount: credits._sum.founding100Credit ?? 0 },
    subscribers: { active: subsActive, newLast30: subsNew, unsubscribedLast30: subsGone },
  };
}
