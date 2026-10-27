// Customers for the admin console, derived from paid, non-cancelled orders and
// grouped by lower(email). One parameterised aggregate query: every dynamic
// value goes through Prisma.sql placeholders, never string concatenation.
import { Prisma, type Role } from "@prisma/client";
import { db } from "@/lib/db";
import { maskEmail } from "@/lib/admin-orders";
import { csvCell } from "@/lib/subscribers";

export const MAX_TAKE = 100;
export const MAX_OFFSET = 10000;
export const MAX_EXPORT = 5000;

export type CustomerSort = "last" | "ltv";

export type CustomerRow = {
  email: string;
  orders: number;
  ltv: number;
  firstOrder: Date;
  lastOrder: Date;
  country: string;
  subscribed: boolean;
  hasPlan: boolean;
};

export function parseSort(v: string | null): CustomerSort {
  return v === "ltv" ? "ltv" : "last";
}

export function clampInt(v: string | null, def: number, min: number, max: number): number {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && v !== null && v !== "" ? Math.min(max, Math.max(min, n)) : def;
}

// Cancelled orders and unpaid orders are excluded from every figure, so a customer
// whose only orders were cancelled does not appear. A one-time item has mode
// oneTime (cart) or one-time (older rows); anything else is a recurring plan.
export async function queryCustomers(opts: {
  search?: string;
  sort: CustomerSort;
  offset: number;
  take: number;
}): Promise<CustomerRow[]> {
  const search = opts.search?.trim().toLowerCase();
  const having = search
    ? Prisma.sql`HAVING bool_or(strpos(lower(o.email), ${search}) > 0 OR strpos(lower(o."lastName"), ${search}) > 0)`
    : Prisma.empty;
  const order =
    opts.sort === "ltv"
      ? Prisma.sql`ORDER BY ltv DESC, email ASC`
      : Prisma.sql`ORDER BY "lastOrder" DESC, email ASC`;

  const rows = await db.$queryRaw<CustomerRow[]>(Prisma.sql`
    WITH agg AS (
      SELECT
        lower(o.email) AS email,
        count(*)::int AS orders,
        COALESCE(sum(o.total), 0)::int AS ltv,
        min(o."createdAt") AS "firstOrder",
        max(o."createdAt") AS "lastOrder",
        (array_agg(o.country ORDER BY o."createdAt" DESC))[1] AS country
      FROM "Order" o
      WHERE o.status = 'paid' AND o."fulfilmentStatus" <> 'cancelled'
      GROUP BY lower(o.email)
      ${having}
    )
    SELECT
      agg.email, agg.orders, agg.ltv, agg."firstOrder", agg."lastOrder", agg.country,
      EXISTS (
        SELECT 1 FROM "EmailSubscriber" s
        WHERE lower(s.email) = agg.email AND s."unsubscribedAt" IS NULL
      ) AS subscribed,
      EXISTS (
        SELECT 1 FROM "OrderItem" i JOIN "Order" o2 ON o2.id = i."orderId"
        WHERE lower(o2.email) = agg.email AND o2.status = 'paid' AND o2."fulfilmentStatus" <> 'cancelled'
          AND i.mode NOT IN ('oneTime', 'one-time')
      ) AS "hasPlan"
    FROM agg
    ${order}
    LIMIT ${opts.take} OFFSET ${opts.offset}
  `);
  return rows;
}

// A Viewer sees that customers exist and what they are worth, not who they are.
export function presentCustomer(c: CustomerRow, role: Role) {
  return {
    email: role === "VIEWER" ? maskEmail(c.email) : c.email,
    orders: c.orders,
    ltv: c.ltv,
    firstOrder: c.firstOrder,
    lastOrder: c.lastOrder,
    country: c.country,
    subscribed: c.subscribed,
    hasPlan: c.hasPlan,
    redacted: role === "VIEWER",
  };
}

export const EXPORT_HEADER =
  "email,orders,lifetime_value_usd,first_order,last_order,country,newsletter_subscribed,has_plan";

// csvCell neutralises cells that start with = + - @ so a customer-typed value
// cannot run as a spreadsheet formula.
export function customerCsvRow(c: CustomerRow): string {
  return [
    c.email,
    String(c.orders),
    String(c.ltv),
    new Date(c.firstOrder).toISOString(),
    new Date(c.lastOrder).toISOString(),
    c.country,
    c.subscribed ? "yes" : "no",
    c.hasPlan ? "yes" : "no",
  ]
    .map(csvCell)
    .join(",");
}
