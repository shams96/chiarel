// How an order's total is shown to a person: what Stripe actually charged, tax
// included, once the order is paid; the pre-tax figure we asked Stripe to charge
// before that. One function so the account page, the admin order screens and
// anything later cannot disagree with the order page and the confirmation email.
// (Plan, Phase A: "Order total shown as 'Total (incl. tax)' everywhere".)
//
// `total` is whole dollars and pre-tax; `amountPaidCents` and `taxCents` are the
// stored payment record (lib/order-payment.ts), written when the order is paid.

export type OrderMoney = {
  total: number;
  amountPaidCents: number | null;
  taxCents: number | null;
};

export function orderTotalLabel(o: Pick<OrderMoney, "taxCents" | "amountPaidCents">): string {
  return o.amountPaidCents != null && (o.taxCents ?? 0) > 0 ? "Total (incl. tax)" : "Total";
}

/** The amount in dollars as text: "$87.42" when Stripe's figure is stored, "$87" otherwise. */
export function orderTotalText(o: OrderMoney): string {
  return o.amountPaidCents != null ? `$${(o.amountPaidCents / 100).toFixed(2)}` : `$${o.total}`;
}

/** Tax as text, or null when there was none (or none is recorded). */
export function orderTaxText(o: Pick<OrderMoney, "taxCents">): string | null {
  return (o.taxCents ?? 0) > 0 ? `$${((o.taxCents ?? 0) / 100).toFixed(2)}` : null;
}
