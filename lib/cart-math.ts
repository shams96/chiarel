import { computeLineSavings, computeUnitPrice, type CartMode } from "@/lib/pricing";
import { getProduct, isPurchasable } from "@/lib/products";

// Optimistic cart updates: the same arithmetic the server does (shared pricing
// code, prices from the catalog files), applied to the bag on screen the moment
// a control is used, so a change shows instantly instead of after a round trip
// to the database (about 0.4 s each, several per request). The server's answer
// replaces this once the last change has landed, so any drift is short-lived.
// Every helper returns null when it cannot compute a line (unknown product), in
// which case the caller just waits for the server.

type Line = { id: string; slug: string; mode: CartMode; qty: number; unitPrice: number };
export type Snapshot<L extends Line = Line> = {
  lines: L[];
  count: number;
  subtotal: number;
  savings: number;
};

function oneTimePrice(slug: string): number | null {
  const p = getProduct(slug);
  return p && isPurchasable(p) ? p.price.oneTime : null;
}

function subscriptionPrice(slug: string): number | null {
  const p = getProduct(slug);
  return p && isPurchasable(p) ? p.price.subscription : null;
}

/** Recomputes count, subtotal and savings from the lines. Null if any line's product is unknown. */
export function withTotals<S extends Snapshot>(snap: S): S | null {
  let subtotal = 0;
  let savings = 0;
  let count = 0;
  for (const l of snap.lines) {
    const oneTime = oneTimePrice(l.slug);
    if (oneTime == null) return null;
    subtotal += l.unitPrice * l.qty;
    savings += Math.max(0, computeLineSavings(oneTime, l.unitPrice, l.mode, l.qty));
    count += l.qty;
  }
  return { ...snap, subtotal, savings, count };
}

export function setLineQty<S extends Snapshot>(snap: S, lineId: string, qty: number): S | null {
  if (!Number.isInteger(qty) || qty < 1) return null;
  if (!snap.lines.some((l) => l.id === lineId)) return null;
  return withTotals({ ...snap, lines: snap.lines.map((l) => (l.id === lineId ? { ...l, qty } : l)) });
}

/** Switches a line to another plan, keeping its quantity, with the unit price the server will charge. */
export function setLinePlan<S extends Snapshot>(snap: S, slug: string, mode: CartMode): S | null {
  const sub = subscriptionPrice(slug);
  const one = oneTimePrice(slug);
  if (sub == null || one == null || !snap.lines.some((l) => l.slug === slug)) return null;
  const unitPrice = computeUnitPrice(sub, one, mode, slug);
  return withTotals({
    ...snap,
    lines: snap.lines.map((l) => (l.slug === slug ? { ...l, mode, unitPrice } : l)),
  });
}

export function removeLine<S extends Snapshot>(snap: S, lineId: string): S | null {
  if (!snap.lines.some((l) => l.id === lineId)) return null;
  return withTotals({ ...snap, lines: snap.lines.filter((l) => l.id !== lineId) });
}
