import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getOrCreateCart } from "@/lib/cart-server";
import { settleCheckoutSession } from "@/lib/order-payment";
import { PLAN_NAME } from "@/lib/plan-labels";
import TrackPurchase from "@/components/TrackPurchase";
import RefreshBag from "@/components/RefreshBag";
import { getProduct } from "@/lib/products";
import { cookies } from "next/headers";
import SaveRitual from "@/components/account/SaveRitual";
import { CUSTOMER_COOKIE, resolveCustomerSession } from "@/lib/customer-session";

const modeLabel: Record<string, string> = PLAN_NAME;

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { id } = await params;
  const { session_id } = await searchParams;

  // A database failure is not "order not found": say so, and let them retry.
  let lookupFailed = false;
  let order = await db.order
    .findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    })
    .catch(() => {
      lookupFailed = true;
      return null;
    });

  if (lookupFailed) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl">We can&rsquo;t load your order just now</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink">
          This is a brief connection issue on our side. Your order is not affected. Please refresh
          in a moment, or <Link href="/contact" className="tap-area underline">contact us</Link>.
        </p>
      </div>
    );
  }

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
      // Same path as the webhook: records the PaymentIntent id and amounts, and
      // sends the confirmation email only if this call made the transition.
      await settleCheckoutSession(order.id, session);
      order = (await db.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: true } } },
      })) ?? order;
      const cart = await getOrCreateCart();
      await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  }

  // A refunded order was still paid; only the money has gone back since.
  const isPaid = order.status === "paid" || order.status === "refunded";
  // Directions for use, only for products whose steps are already published on
  // the product page (data/products.json howToUse). Nothing is written here.
  const usage = isPaid
    ? order.items.flatMap((i) => {
        const steps = getProduct(i.productSlug)?.howToUse;
        return steps && steps.length > 0 ? [{ slug: i.productSlug, name: i.product.name, steps }] : [];
      })
    : [];
  const taxCents = order.taxCents ?? 0;
  // What Stripe actually took, tax included; the pre-tax order total until then.
  const paidCents = order.amountPaidCents ?? order.total * 100;
  // Offer an account only to someone who does not have one open. A failed lookup
  // (database trouble) just hides the offer; it never blocks the confirmation.
  const signedIn = await resolveCustomerSession((await cookies()).get(CUSTOMER_COOKIE)?.value).catch(() => null);

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      {isPaid && <RefreshBag />}
      {isPaid && (
        <TrackPurchase
          purchase={{
            transaction_id: order.id,
            currency: "USD", // every session is created in usd (app/api/checkout/route.ts)
            value: paidCents / 100,
            shipping: order.shipping,
            items: order.items.map((i) => ({
              item_id: i.productSlug,
              item_name: i.product.name,
              price: i.unitPrice,
              quantity: i.qty,
            })),
          }}
        />
      )}
      {isPaid && <p className="mb-3 text-eyebrow uppercase text-ochre">Welcome to the House of Clarity</p>}
      <h1 className="font-serif text-3xl">Thank you, {order.firstName}.</h1>
      {isPaid ? (
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink">
          Payment received. Order{" "}
          <span className="font-medium text-ink">#{order.id.slice(-8).toUpperCase()}</span>{" "}
          is confirmed
          {order.confirmationEmailAt ? ` — a confirmation has been sent to ${order.email}.` : "."}
        </p>
      ) : (
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink">
          We couldn&rsquo;t confirm payment for order{" "}
          <span className="font-medium text-ink">#{order.id.slice(-8).toUpperCase()}</span>{" "}
          yet. If you completed checkout, please{" "}
          <Link href="/contact" className="tap-area underline">contact us</Link> — otherwise no
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
              <p className="text-[12px] text-ink">
                {modeLabel[item.mode]} · Qty {item.qty}
              </p>
            </div>
            <p className="text-sm">${item.unitPrice * item.qty}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2 border-t border-ink/10 pt-4 text-left text-sm">
        <div className="flex justify-between text-ink">
          <span>Subtotal</span>
          <span>${order.subtotal}</span>
        </div>
        {order.savings > 0 && (
          <div className="flex justify-between text-ochre">
            <span>Ritual savings (already applied)</span>
            <span>−${order.savings}</span>
          </div>
        )}
        <div className="flex justify-between text-ink">
          <span>Shipping</span>
          <span>{order.shipping === 0 ? "Complimentary" : `$${order.shipping}`}</span>
        </div>
        {isPaid && taxCents > 0 && (
          <div className="flex justify-between text-ink">
            <span>Tax</span>
            <span>${(taxCents / 100).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-ink/10 pt-3 text-base">
          <span>{isPaid && taxCents > 0 ? "Total (incl. tax)" : "Total"}</span>
          <span className="font-serif text-xl">
            {isPaid && order.amountPaidCents != null ? `$${(paidCents / 100).toFixed(2)}` : `$${order.total}`}
          </span>
        </div>
      </div>

      {isPaid && usage.length > 0 && (
        <section className="mt-10 border-t border-ink/10 pt-8 text-left" aria-labelledby="ritual-start">
          <h2 id="ritual-start" className="font-serif text-xl">
            Your CHIAREL Ritual
          </h2>
          <p className="mt-1 text-[13px] text-ink">How to use what you ordered.</p>
          <div className="mt-4 space-y-5">
            {usage.map((u) => (
              <div key={u.slug}>
                <h3 className="text-sm font-medium">{u.name}</h3>
                <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-[13px] leading-relaxed text-ink">
                  {u.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      )}

      {isPaid && !signedIn && <SaveRitual email={order.email} />}

      <Link
        href="/"
        className="mt-10 inline-block border border-ink px-8 py-3 text-eyebrow uppercase transition hover:border-ochre hover:text-ochre"
      >
        Return to the House
      </Link>
    </div>
  );
}
