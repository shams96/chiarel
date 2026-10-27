// Fulfilment state machine for admin order handling. Separate from Order.status
// (the payment state read by checkout, the Stripe webhook and the dispute
// monitor). See claudedocs/specs/admin-console/P1-ORDERS-PLAN.md.
import type { Role } from "@prisma/client";

export const FULFILMENT_STATUSES = ["unfulfilled", "packed", "shipped", "delivered", "cancelled"] as const;
export type FulfilmentStatus = (typeof FULFILMENT_STATUSES)[number];

const TRANSITIONS: Record<FulfilmentStatus, FulfilmentStatus[]> = {
  unfulfilled: ["packed", "cancelled"],
  packed: ["unfulfilled", "shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function isFulfilmentStatus(v: unknown): v is FulfilmentStatus {
  return typeof v === "string" && (FULFILMENT_STATUSES as readonly string[]).includes(v);
}

export function allowedNext(from: FulfilmentStatus): FulfilmentStatus[] {
  return TRANSITIONS[from] ?? [];
}

const MAX_TRACKING = 80;
const MAX_NOTE = 1000;

export type OrderForUpdate = {
  status: string;
  fulfilmentStatus: string;
  trackingCarrier: string | null;
  trackingNumber: string | null;
};

export type UpdateInput = {
  fulfilmentStatus?: unknown;
  trackingCarrier?: unknown;
  trackingNumber?: unknown;
  internalNote?: unknown;
};

export type UpdatePlan =
  | { ok: true; changed: boolean; data: Record<string, unknown>; from: FulfilmentStatus; to: FulfilmentStatus }
  | { ok: false; status: number; error: string };

const fail = (status: number, error: string): UpdatePlan => ({ ok: false, status, error });

function cleanText(v: unknown, max: number): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t === "" ? null : t.slice(0, max + 1);
}

// Pure: decides whether an edit is allowed and what to write. The route applies
// `data` with a conditional update (so two editors cannot both win) and audits it.
export function planOrderUpdate(order: OrderForUpdate, input: UpdateInput, role: Role): UpdatePlan {
  if (!isFulfilmentStatus(order.fulfilmentStatus)) return fail(500, "Order has an unknown fulfilment state");
  const from = order.fulfilmentStatus;
  const to = input.fulfilmentStatus === undefined ? from : input.fulfilmentStatus;
  if (!isFulfilmentStatus(to)) {
    return fail(400, `fulfilmentStatus must be one of: ${FULFILMENT_STATUSES.join(", ")}`);
  }

  const data: Record<string, unknown> = {};

  if (to !== from) {
    if (!allowedNext(from).includes(to)) {
      return fail(409, `An order that is ${from} cannot become ${to}`);
    }
    if (to === "cancelled" && role !== "ADMIN") {
      return fail(403, "Only an Admin can cancel an order");
    }
    if (to !== "cancelled" && to !== "unfulfilled" && order.status !== "paid") {
      return fail(409, "Only a paid order can be packed or shipped");
    }
    data.fulfilmentStatus = to;
    if (to === "shipped") data.shippedAt = new Date();
    if (to === "delivered") data.deliveredAt = new Date();
  }

  const carrier = cleanText(input.trackingCarrier, MAX_TRACKING);
  const number = cleanText(input.trackingNumber, MAX_TRACKING);
  for (const v of [carrier, number]) {
    if (typeof v === "string" && v.length > MAX_TRACKING) {
      return fail(400, `Carrier and tracking number must be at most ${MAX_TRACKING} characters`);
    }
  }
  const touchesTracking = carrier !== undefined || number !== undefined;
  if (touchesTracking) {
    if (to !== "shipped" && to !== "delivered") {
      return fail(400, "Tracking can only be set on a shipped or delivered order");
    }
    if (carrier !== undefined) data.trackingCarrier = carrier;
    if (number !== undefined) data.trackingNumber = number;
  }
  if (to === "shipped" && from !== "shipped") {
    const finalCarrier = carrier !== undefined ? carrier : order.trackingCarrier;
    const finalNumber = number !== undefined ? number : order.trackingNumber;
    if (!finalCarrier || !finalNumber) {
      return fail(400, "Carrier and tracking number are required to mark an order shipped");
    }
    data.trackingCarrier = finalCarrier;
    data.trackingNumber = finalNumber;
  }

  const note = cleanText(input.internalNote, MAX_NOTE);
  if (typeof note === "string" && note.length > MAX_NOTE) {
    return fail(400, `Note must be at most ${MAX_NOTE} characters`);
  }
  if (note !== undefined) data.internalNote = note;

  return { ok: true, changed: Object.keys(data).length > 0, data, from, to };
}
