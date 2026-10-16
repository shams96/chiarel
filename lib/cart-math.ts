import { computeLineSavings, computeUnitPrice, type CartMode } from "@/lib/pricing";
import { MAX_LINE_QTY } from "@/lib/cart-limits";
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
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_LINE_QTY) return null;
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

// Sets (e.g. The Ritual Set) list the products they include. A bag that holds a
// set already covers those products, so they are not offered as upsells and a
// separately added component is flagged (never auto-removed).

type SlugLine = { slug: string };

/** Slugs of products covered by a set that is in the bag. */
export function slugsCoveredBySets(lines: SlugLine[]): Set<string> {
  const covered = new Set<string>();
  for (const l of lines) {
    const p = getProduct(l.slug);
    if (p?.set && p.includes) for (const s of p.includes) covered.add(s);
  }
  return covered;
}

/** First candidate not already in the bag and not covered by a set in it. */
export function pickUpsell<P extends { slug: string }>(candidates: P[], lines: SlugLine[]): P | undefined {
  const covered = slugsCoveredBySets(lines);
  return candidates.find((p) => !lines.some((l) => l.slug === p.slug) && !covered.has(p.slug));
}

/** Bag lines whose product is already included in a set that is also in the bag. */
export function redundantComponents(lines: SlugLine[]): { slug: string; name: string; setName: string }[] {
  const out: { slug: string; name: string; setName: string }[] = [];
  for (const l of lines) {
    const owner = lines
      .map((o) => getProduct(o.slug))
      .find((p) => p?.set && p.includes?.includes(l.slug));
    const self = getProduct(l.slug);
    if (owner && self) out.push({ slug: l.slug, name: self.name, setName: owner.name });
  }
  return out;
}

export function removeLine<S extends Snapshot>(snap: S, lineId: string): S | null {
  if (!snap.lines.some((l) => l.id === lineId)) return null;
  return withTotals({ ...snap, lines: snap.lines.filter((l) => l.id !== lineId) });
}
