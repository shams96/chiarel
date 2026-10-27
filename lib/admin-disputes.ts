// Shaping for the admin disputes screen: the evidence checklist, the Stripe
// dashboard link and the per-dispute view. Pure functions, unit-tested; the
// route only fetches rows. See claudedocs/specs/admin-console/P1B-PLAN.md.

export type EvidenceKey = "terms" | "tracking" | "shipped" | "delivered" | "email" | "address" | "items";

export type EvidenceItem = { key: EvidenceKey; label: string; present: boolean; detail: string | null };

export type DisputeOrder = {
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
  total: number;
  status: string;
  fulfilmentStatus: string;
  termsAcceptedAt: Date | null;
  termsVersion: string | null;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  stripePaymentIntentId: string | null;
  disputeId: string | null;
  disputeStatus: string | null;
  disputeReason: string | null;
  disputeAmount: number | null;
  disputeOpenedAt: Date | null;
  disputeClosedAt: Date | null;
  items: { qty: number; unitPrice: number; mode: string; productSlug: string; product?: { name: string } }[];
};

const filled = (v: string | null | undefined) => typeof v === "string" && v.trim() !== "";
const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

// What Stripe asks for when you answer a dispute, as far as this store records
// it. A missing item is a gap to chase before the response deadline, not an error.
export function evidenceChecklist(o: DisputeOrder): { items: EvidenceItem[]; missing: EvidenceKey[]; complete: boolean } {
  const items: EvidenceItem[] = [
    {
      key: "terms",
      label: "Terms and refund policy accepted at checkout",
      present: o.termsAcceptedAt != null && filled(o.termsVersion),
      detail: o.termsAcceptedAt ? `${day(o.termsAcceptedAt)}, version ${o.termsVersion ?? "unknown"}` : null,
    },
    {
      key: "tracking",
      label: "Carrier and tracking number",
      present: filled(o.trackingCarrier) && filled(o.trackingNumber),
      detail: filled(o.trackingNumber) ? `${o.trackingCarrier ?? "?"} ${o.trackingNumber}` : null,
    },
    { key: "shipped", label: "Shipped date", present: o.shippedAt != null, detail: day(o.shippedAt) },
    { key: "delivered", label: "Delivered date", present: o.deliveredAt != null, detail: day(o.deliveredAt) },
    { key: "email", label: "Customer email", present: filled(o.email), detail: filled(o.email) ? o.email : null },
    {
      key: "address",
      label: "Shipping address",
      present: filled(o.address) && filled(o.city) && filled(o.country),
      detail: filled(o.address) ? `${o.address}, ${o.city}, ${o.country}` : null,
    },
    {
      key: "items",
      label: "Itemised order",
      present: o.items.length > 0,
      detail: o.items.length ? o.items.map((i) => `${i.qty} x ${i.product?.name ?? i.productSlug}`).join("; ") : null,
    },
  ];
  const missing = items.filter((i) => !i.present).map((i) => i.key);
  return { items, missing, complete: missing.length === 0 };
}

const PI = /^pi_[A-Za-z0-9_]+$/;

// A link into the Stripe dashboard for the payment. Only a well-formed pi_ id is
// ever placed in the URL, and an unknown key mode gets no link rather than a
// link into the wrong environment.
export function stripePaymentUrl(paymentIntentId: string | null, mode: "test" | "live" | "unknown"): string | null {
  if (!paymentIntentId || !PI.test(paymentIntentId) || mode === "unknown") return null;
  return `https://dashboard.stripe.com/${mode === "test" ? "test/" : ""}payments/${paymentIntentId}`;
}

export function presentDispute(o: DisputeOrder, mode: "test" | "live" | "unknown") {
  const checklist = evidenceChecklist(o);
  return {
    orderId: o.id,
    disputeId: o.disputeId,
    status: o.disputeStatus,
    reason: o.disputeReason,
    amount: o.disputeAmount,
    openedAt: o.disputeOpenedAt,
    closedAt: o.disputeClosedAt,
    open: o.disputeClosedAt == null,
    orderTotal: o.total,
    orderPlacedAt: o.createdAt,
    customer: `${o.firstName} ${o.lastName}`.trim(),
    email: o.email,
    country: o.country,
    fulfilmentStatus: o.fulfilmentStatus,
    evidence: checklist.items,
    missing: checklist.missing,
    evidenceComplete: checklist.complete,
    stripeUrl: stripePaymentUrl(o.stripePaymentIntentId, mode),
  };
}
