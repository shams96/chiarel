import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getOrCreateCart } from "@/lib/cart-server";

const modeLabel: Record<string, string> = {
  ninetyDay: "The Ritual Plan",
  subscription: "Subscription",
  oneTime: "One-time",
};

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { id } = await params;
  const { session_id } = await searchParams;

  let order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  // This page has no auth system to check against, and order ids appear in
  // URLs (redirect, browser history, anything pasted into a support ticket)
  // — so the *only* thing standing between "not found" and rendering a
  // stranger's name, email, address, and full order contents was the order
  // id itself. cuid()s aren't sequential, but "not guessable at random" is
  // not the same bar as "only the customer can view this": anyone who ever
  // has the URL, forever, could load it. The Stripe session_id Stripe put
  // in the success_url (`?session_id={CHECKOUT_SESSION_ID}`) is the actual
  // capability the customer holds that a stranger with just the order id
  // doesn't — so require it to match before showing anything but a generic
  // not-found, exactly like an unrecognized id. This doesn't change the
  // reconciliation logic below at all (that already required a matching
  // session_id before touching status); it just makes matching session_id
  // a precondition for *viewing* the order too, not only for updating it.
  if (!order || session_id !== order.stripeSessionId) notFound();

  // Never trust the redirect itself as proof of payment — re-verify the
  // session with Stripe server-side before marking an order paid, and empty
  // the cart only once we know a charge actually succeeded.
  if (order.status === "pending" && session_id && session_id === order.stripeSessionId) {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === "paid") {
      order = await db.order.update({
        where: { id: order.id },
        data: { status: "paid" },
        include: { items: { include: { product: true } } },
      });
      const cart = await getOrCreateCart();
      await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  }

  const isPaid = order.status === "paid";

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-serif text-3xl">Thank you, {order.firstName}.</h1>
      {isPaid ? (
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/70">
          Payment received. Order{" "}
          <span className="font-medium text-ink">#{order.id.slice(-8).toUpperCase()}</span>{" "}
          is confirmed — a receipt has been sent to {order.email}.
        </p>
      ) : (
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/70">
          We couldn&rsquo;t confirm payment for order{" "}
          <span className="font-medium text-ink">#{order.id.slice(-8).toUpperCase()}</span>{" "}
          yet. If you completed checkout, please{" "}
          <Link href="/" className="underline">contact us</Link> — otherwise no
          charge has been made.
        </p>
      )}

      <ul className="mt-10 space-y-4 border-t border-ink/10 pt-8 text-left">
        {order.items.map((item) => (
          <li key={item.id} className="flex gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-cloud/50">
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
              <p className="text-[11px] text-ink/65">
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
