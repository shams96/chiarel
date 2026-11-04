import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ORDERS_EMAIL } from "@/lib/seo";
import { productHref } from "@/lib/products";
import { CUSTOMER_COOKIE, resolveCustomerSession } from "@/lib/customer-session";
import SignOutButton from "@/components/account/SignOutButton";
import SessionKeepAlive from "@/components/account/SessionKeepAlive";

export const metadata = { title: "Account", robots: { index: false, follow: false } };
// Reads the session cookie, so it can never be prerendered or cached.
export const dynamic = "force-dynamic";

const FULFILMENT: Record<string, string> = {
  unfulfilled: "Being prepared",
  packed: "Packed",
  shipped: "On its way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

function SubscriptionCare() {
  return (
    <div className="mt-10 border border-ink/15 p-6">
      <p className="text-[12px] uppercase tracking-[0.16em] text-ink/70">Subscription Care</p>
      <p className="mt-3 text-sm leading-relaxed text-ink/80">
        <a href={`mailto:${ORDERS_EMAIL}`} className="border-b border-ochre pb-0.5 text-ochre">
          {ORDERS_EMAIL}
        </a>
      </p>
      <p className="mt-4 text-[13px] leading-relaxed text-ink/70">
        There is no commitment. Subscriptions renew every 45 days and can be adjusted whenever you ask.
      </p>
      <Link
        href="/contact"
        className="mt-5 inline-block text-[12px] uppercase tracking-[0.14em] text-ink underline underline-offset-4"
      >
        All contact details
      </Link>
    </div>
  );
}

export default async function AccountPage() {
  const raw = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  let auth;
  try {
    auth = await resolveCustomerSession(raw);
  } catch {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <h1 className="font-serif text-4xl">Your Ritual</h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink/80">
          Your account is temporarily unavailable. Please try again in a moment. You can still{" "}
          <Link href="/shop" className="text-ink underline underline-offset-4">
            order as a guest
          </Link>
          .
        </p>
      </div>
    );
  }
  if (!auth) redirect("/account/login");

  const orders = await db.order.findMany({
    where: { customerId: auth.customer.id, status: { not: "pending" } },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <SessionKeepAlive />
      <h1 className="font-serif text-4xl">Your Ritual</h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink/80">
        Signed in as <span className="break-all text-ink">{auth.customer.email}</span>. <SignOutButton />
      </p>

      <h2 className="mt-12 text-[12px] uppercase tracking-[0.16em] text-ink/70">Orders</h2>
      {orders.length === 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink/80">
          No orders on this address yet.{" "}
          <Link href="/shop" className="text-ink underline underline-offset-4">
            Visit the shop
          </Link>
        </p>
      ) : (
        <ul className="mt-4 space-y-6">
          {orders.map((o) => (
            <li key={o.id} className="border border-ink/15 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm">
                  Order <span className="text-ink">#{o.id.slice(-8).toUpperCase()}</span>
                  <span className="text-ink/70"> · {dateFormat.format(o.createdAt)}</span>
                </p>
                <p className="text-sm">${o.total}</p>
              </div>
              <p className="mt-2 text-[13px] text-ink/80">
                {FULFILMENT[o.fulfilmentStatus] ?? o.fulfilmentStatus}
                {o.trackingNumber && (
                  <span className="text-ink/70">
                    {" "}
                    · {o.trackingCarrier ? `${o.trackingCarrier} ` : ""}tracking {o.trackingNumber}
                  </span>
                )}
              </p>
              <ul className="mt-4 space-y-2 border-t border-ink/10 pt-4">
                {o.items.map((i) => (
                  <li key={i.id} className="flex items-baseline justify-between gap-3 text-sm">
                    <span>
                      {i.product.name}
                      <span className="text-ink/70"> · Qty {i.qty}</span>
                    </span>
                    <Link
                      href={productHref(i.productSlug)}
                      className="shrink-0 text-[12px] uppercase tracking-[0.14em] text-ink underline underline-offset-4"
                    >
                      Reorder
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <SubscriptionCare />
    </div>
  );
}
