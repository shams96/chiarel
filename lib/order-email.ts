import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";

function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

type EmailOrder = {
  id: string;
  firstName: string;
  email: string;
  subtotal: number;
  savings: number;
  shipping: number;
  total: number;
  amountPaidCents: number | null;
  taxCents: number | null;
  items: { qty: number; unitPrice: number; mode: string; product: { name: string } }[];
};

const MODE: Record<string, string> = {
  ninetyDay: "90-day plan",
  subscription: "Subscription",
  oneTime: "One-time",
};

/** Plain-text confirmation. States only what the order record holds. */
export function composeOrderConfirmation(order: EmailOrder): { subject: string; text: string } {
  const ref = order.id.slice(-8).toUpperCase();
  const lines = order.items.map(
    (i) => `${i.product.name} (${MODE[i.mode] ?? i.mode}) x ${i.qty}   ${dollars(i.unitPrice * i.qty * 100)}`,
  );
  const tax = order.taxCents ?? 0;
  const paid = order.amountPaidCents ?? order.total * 100;
  const totals = [
    `Subtotal   ${dollars(order.subtotal * 100)}`,
    ...(order.savings > 0 ? [`Ritual savings (already applied)   -${dollars(order.savings * 100)}`] : []),
    `Shipping   ${order.shipping === 0 ? "Complimentary" : dollars(order.shipping * 100)}`,
    ...(tax > 0 ? [`Tax   ${dollars(tax)}`] : []),
    `${tax > 0 ? "Total (incl. tax)" : "Total"}   ${dollars(paid)}`,
  ];
  const text = [
    `Thank you, ${order.firstName}.`,
    "",
    `We have received your payment for order #${ref}.`,
    "",
    ...lines,
    "",
    ...totals,
    "",
    "Reply to this email if anything looks wrong.",
    "",
    "CHIAREL",
  ].join("\n");
  return { subject: `Your CHIAREL order #${ref}`, text };
}

/**
 * Send the order confirmation and record when it went out. Throws on failure so
 * the caller can log it; the timestamp is only written after a successful send,
 * which keeps the order page from claiming an email that never left.
 */
export async function sendOrderConfirmation(orderId: string): Promise<void> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { select: { name: true } } } } },
  });
  if (!order || order.confirmationEmailAt) return;
  const { subject, text } = composeOrderConfirmation(order);
  await sendMail({ to: order.email, subject, text, fromAccounts: false });
  await db.order.update({ where: { id: orderId }, data: { confirmationEmailAt: new Date() } });
}
