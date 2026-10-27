// Shaping of order data for the admin console: Viewer redaction and the
// fulfilment CSV. Kept out of the routes so it is unit-testable.
import type { Role } from "@prisma/client";
import { csvCell } from "@/lib/subscribers";

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
}

export function shortId(id: string): string {
  return id.slice(-8);
}

type OrderRow = {
  id: string;
  createdAt: Date;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string | null;
  zip: string | null;
  country: string;
  subtotal: number;
  savings: number;
  shipping: number;
  total: number;
  status: string;
  fulfilmentStatus: string;
  bonusSample: boolean;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  internalNote: string | null;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  disputeId: string | null;
  disputeStatus: string | null;
  disputeReason: string | null;
  disputeAmount: number | null;
  disputeOpenedAt: Date | null;
  disputeClosedAt: Date | null;
  founding100Credit: number | null;
  founding100CreditIssuedAt: Date | null;
  termsAcceptedAt: Date | null;
  termsVersion: string | null;
  items?: { id: string; productSlug: string; mode: string; qty: number; unitPrice: number; product?: { name: string } }[];
};

// A Viewer sees that orders exist and how they are going, not who placed them:
// no name, street address, full email, Stripe ids or internal notes.
export function presentOrder(o: OrderRow, role: Role) {
  const items = o.items?.map((i) => ({
    id: i.id,
    productSlug: i.productSlug,
    productName: i.product?.name ?? i.productSlug,
    mode: i.mode,
    qty: i.qty,
    unitPrice: i.unitPrice,
  }));
  if (role === "VIEWER") {
    return {
      id: o.id,
      createdAt: o.createdAt,
      email: maskEmail(o.email),
      country: o.country,
      subtotal: o.subtotal,
      savings: o.savings,
      shipping: o.shipping,
      total: o.total,
      status: o.status,
      fulfilmentStatus: o.fulfilmentStatus,
      shippedAt: o.shippedAt,
      deliveredAt: o.deliveredAt,
      disputeStatus: o.disputeStatus,
      items,
      redacted: true,
    };
  }
  return { ...o, items, redacted: false };
}

export const EXPORT_HEADER =
  "order_id,created_at,name,email,address,city,state,zip,country,items,bonus_sample,shipping_usd,total_usd,fulfilment_status";

// One row per order for the pick-and-pack sheet. Every cell goes through
// csvCell so a customer-typed value starting with = + - @ cannot run as a
// spreadsheet formula.
export function exportRow(o: OrderRow): string {
  const items = (o.items ?? []).map((i) => `${i.qty} x ${i.product?.name ?? i.productSlug}`).join("; ");
  return [
    o.id,
    o.createdAt.toISOString(),
    `${o.firstName} ${o.lastName}`.trim(),
    o.email,
    o.address,
    o.city,
    o.state ?? "",
    o.zip ?? "",
    o.country,
    items,
    o.bonusSample ? "yes" : "no",
    String(o.shipping),
    String(o.total),
    o.fulfilmentStatus,
  ]
    .map(csvCell)
    .join(",");
}
