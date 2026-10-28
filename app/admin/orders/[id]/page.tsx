"use client";

// Order detail and fulfilment controls. Buttons offered come from the API
// (allowedNext); the API still enforces every rule, including who may cancel.
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  PageShell,
  PageHeader,
  Alert,
  Badge,
  Button,
  Card,
  Field,
  inputClass,
  Loading,
  SectionTitle,
  statusTone,
} from "@/components/admin/ui";

type Item = { id: string; productName: string; mode: string; qty: number; unitPrice: number };
type Order = {
  id: string;
  createdAt: string;
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string | null;
  zip?: string | null;
  country: string;
  subtotal: number;
  savings: number;
  shipping: number;
  total: number;
  status: string;
  fulfilmentStatus: string;
  trackingCarrier?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  internalNote?: string | null;
  bonusSample?: boolean;
  stripePaymentIntentId?: string | null;
  disputeStatus?: string | null;
  disputeReason?: string | null;
  founding100Credit?: number | null;
  founding100CreditIssuedAt?: string | null;
  items?: Item[];
  redacted: boolean;
};

const LABEL: Record<string, string> = {
  unfulfilled: "Mark unfulfilled",
  packed: "Mark packed",
  shipped: "Mark shipped",
  delivered: "Mark delivered",
  cancelled: "Cancel order (does not refund)",
};

export default function AdminOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [next, setNext] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/orders/${id}`);
    if (res.status === 404) return setError("Order not found.");
    if (!res.ok) return setError("Failed to load the order.");
    const json = await res.json();
    setOrder(json.order);
    setNext(json.allowedNext ?? []);
    setCarrier(json.order.trackingCarrier ?? "");
    setTracking(json.order.trackingNumber ?? "");
    setNote(json.order.internalNote ?? "");
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(body: Record<string, unknown>, done: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "Could not update the order");
      if (res.status === 409) load();
      return;
    }
    setNotice(done);
    await load();
  }

  function move(to: string) {
    if (to === "cancelled" && !window.confirm("Cancel this order? This does not refund the customer; do that in Stripe.")) return;
    const body: Record<string, unknown> = { fulfilmentStatus: to };
    if (to === "shipped") {
      body.trackingCarrier = carrier;
      body.trackingNumber = tracking;
    }
    patch(body, `Order is now ${to}.`);
  }

  if (error && !order) {
    return (
      <PageShell narrow>
        <Alert kind="error">{error}</Alert>
        <Link href="/admin/orders" className="text-garden underline underline-offset-4">
          Back to orders
        </Link>
      </PageShell>
    );
  }
  if (!order) {
    return (
      <PageShell>
        <Loading />
      </PageShell>
    );
  }

  const editable = !order.redacted;
  const showTracking = next.includes("shipped") || order.fulfilmentStatus === "shipped" || order.fulfilmentStatus === "delivered";

  return (
    <PageShell>
      <p className="mb-4 text-[13px]">
        <Link href="/admin/orders" className="text-garden underline underline-offset-4 hover:text-redochre">
          Back to orders
        </Link>
      </p>
      <PageHeader
        eyebrow="Order"
        title={order.id.slice(-8)}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span>Placed {new Date(order.createdAt).toLocaleString()}</span>
            <span className="flex items-center gap-2">
              Payment: <Badge tone={statusTone(order.status)}>{order.status}</Badge>
            </span>
            <span className="flex items-center gap-2">
              Fulfilment: <Badge tone={statusTone(order.fulfilmentStatus)}>{order.fulfilmentStatus}</Badge>
            </span>
            {order.disputeStatus && (
              <span className="flex items-center gap-2">
                Dispute: <Badge tone="danger">{order.disputeStatus}</Badge>
              </span>
            )}
          </span>
        }
      />

      {order.redacted && <Alert kind="info">Read-only view: customer details are hidden for your role.</Alert>}
      {error && <Alert kind="error">{error}</Alert>}
      {notice && <Alert kind="success">{notice}</Alert>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <Card>
            <h2 className="font-serif text-[1.4rem] text-garden">Items</h2>
            <ul className="mt-4 divide-y divide-champagne/50">
              {order.items?.map((i) => (
                <li key={i.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                  <span className="text-[15px]">
                    {i.qty} x {i.productName}
                  </span>
                  <span className="flex items-baseline gap-4 text-[14px]">
                    <span className="text-ink/75">{i.mode}</span>
                    <span className="font-serif text-[17px] tabular-nums">${i.unitPrice}</span>
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 grid gap-1 border-t border-champagne pt-4 text-[14px]">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">${order.subtotal}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Savings</dt>
                <dd className="tabular-nums">${order.savings}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd className="tabular-nums">${order.shipping}</dd>
              </div>
              <div className="flex justify-between pt-2 font-serif text-[1.4rem] text-garden">
                <dt>Total</dt>
                <dd className="tabular-nums">${order.total}</dd>
              </div>
            </dl>
            {order.bonusSample && (
              <p className="mt-4">
                <Badge tone="warn">Include the bonus sample</Badge>
              </p>
            )}
            {order.founding100Credit != null && (
              <p className="mt-4 text-[14px]">
                Founding 100 credit: <span className="font-serif tabular-nums">${order.founding100Credit}</span>{" "}
                <Badge tone={order.founding100CreditIssuedAt ? "ok" : "warn"}>{order.founding100CreditIssuedAt ? "issued" : "owed"}</Badge>
              </p>
            )}
          </Card>

          {editable && (
            <>
              <SectionTitle>Internal note</SectionTitle>
              <Card tone="peach">
                <Field label="Note (staff only)">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    className={inputClass}
                  />
                </Field>
                <div className="mt-4">
                  <Button variant="secondary" disabled={busy} onClick={() => patch({ internalNote: note }, "Note saved.")}>
                    Save note
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>

        <div className="grid content-start gap-6">
          <Card tone="peach">
            <h2 className="font-serif text-[1.4rem] text-garden">Customer</h2>
            <p className="mt-3 text-[15px] leading-relaxed">
              {order.firstName} {order.lastName}
              <br />
              {order.email}
              {!order.redacted && (
                <>
                  <br />
                  {order.address}, {order.city}
                  {order.state ? `, ${order.state}` : ""} {order.zip ?? ""}, {order.country}
                </>
              )}
              {order.redacted && <> · {order.country}</>}
            </p>
          </Card>

          {editable && (
            <Card tone="garden">
              <h2 className="font-serif text-[1.4rem]">Fulfilment</h2>
              {order.status !== "paid" && next.length > 0 && (
                <p className="mt-3 text-[14px] text-ivory/90">Unpaid: it cannot be packed or shipped yet.</p>
              )}
              {showTracking && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-[11px] uppercase tracking-[0.24em] text-ivory/90">
                    Carrier
                    <input
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      maxLength={80}
                      disabled={order.fulfilmentStatus === "delivered"}
                      className={`${inputClass} mt-1.5 normal-case tracking-normal disabled:opacity-70`}
                    />
                  </label>
                  <label className="block text-[11px] uppercase tracking-[0.24em] text-ivory/90">
                    Tracking number
                    <input
                      value={tracking}
                      onChange={(e) => setTracking(e.target.value)}
                      maxLength={80}
                      disabled={order.fulfilmentStatus === "delivered"}
                      className={`${inputClass} mt-1.5 normal-case tracking-normal disabled:opacity-70`}
                    />
                  </label>
                  {order.fulfilmentStatus === "shipped" && (
                    <div className="sm:col-span-2">
                      <Button
                        variant="champagne"
                        disabled={busy}
                        onClick={() => patch({ trackingCarrier: carrier, trackingNumber: tracking }, "Tracking saved.")}
                      >
                        Save tracking
                      </Button>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                {next
                  .filter((n) => order.status === "paid" || n === "cancelled" || n === "unfulfilled")
                  .map((n) => (
                    <Button
                      key={n}
                      variant={n === "cancelled" ? "danger" : "champagne"}
                      disabled={busy}
                      onClick={() => move(n)}
                      className={n === "cancelled" ? "border-ivory" : undefined}
                    >
                      {LABEL[n] ?? n}
                    </Button>
                  ))}
                {next.length === 0 && (
                  <span className="text-[14px] text-ivory/90">This order is {order.fulfilmentStatus}; no further steps.</span>
                )}
              </div>
              {(order.shippedAt || order.deliveredAt) && (
                <div className="mt-5 grid gap-1 border-t border-ivory/30 pt-4 text-[14px]">
                  {order.shippedAt && <p>Shipped {new Date(order.shippedAt).toLocaleString()}</p>}
                  {order.deliveredAt && <p>Delivered {new Date(order.deliveredAt).toLocaleString()}</p>}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
}
