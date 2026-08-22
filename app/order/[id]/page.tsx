import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

const modeLabel: Record<string, string> = {
  ninetyDay: "The Ritual Plan",
  subscription: "Subscription",
  oneTime: "One-time",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="eyebrow">Order Confirmed</p>
      <h1 className="mt-2 font-serif text-3xl">Thank you, {order.firstName}.</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/70">
        Your ritual has been recorded. Order{" "}
        <span className="font-medium text-ink">#{order.id.slice(-8).toUpperCase()}</span>{" "}
        will be confirmed by email at {order.email} once card processing is
        live with our Shopify boutique — no charge has been made today.
      </p>

      <ul className="mt-10 space-y-4 border-t border-ink/10 pt-8 text-left">
        {order.items.map((item) => (
          <li key={item.id} className="flex gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-cloud/50">
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 text-sm">
              <p className="leading-tight">{item.product.name}</p>
              <p className="text-[11px] text-ink/50">
                {modeLabel[item.mode]} · Qty {item.qty}
              </p>
            </div>
            <p className="text-sm">${item.unitPrice * item.qty}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2 border-t border-ink/10 pt-4 text-left text-sm">
        <div className="flex justify-between text-ink/70">
          <span>Subtotal</span>
          <span>${order.subtotal}</span>
        </div>
        {order.savings > 0 && (
          <div className="flex justify-between text-ochre">
            <span>Ritual savings</span>
            <span>−${order.savings}</span>
          </div>
        )}
        <div className="flex justify-between text-ink/70">
          <span>Shipping</span>
          <span>{order.shipping === 0 ? "Complimentary" : `$${order.shipping}`}</span>
        </div>
        <div className="flex justify-between border-t border-ink/10 pt-3 text-base">
          <span>Total</span>
          <span className="font-serif text-xl">${order.total}</span>
        </div>
      </div>

      <Link
        href="/"
        className="mt-10 inline-block border border-ink px-8 py-3 text-[12px] uppercase tracking-[0.25em] transition hover:border-ochre hover:text-ochre"
      >
        Return to the House
      </Link>
    </div>
  );
}
