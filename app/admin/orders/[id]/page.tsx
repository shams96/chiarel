"use client";

// Order detail and fulfilment controls. Buttons offered come from the API
// (allowedNext); the API still enforces every rule, including who may cancel.
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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

  if (error && !order) return <p style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>{error}</p>;
  if (!order) return <p style={{ padding: 32, fontFamily: "system-ui, sans-serif", fontSize: 13 }}>Loading…</p>;

  const editable = !order.redacted;
  const showTracking = next.includes("shipped") || order.fulfilmentStatus === "shipped" || order.fulfilmentStatus === "delivered";
  const field = { display: "block", padding: 6, width: "100%" } as const;

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif", fontSize: 13 }}>
      <p>
        <Link href="/admin/orders">Back to orders</Link>
      </p>
      <h1 style={{ fontSize: 20, margin: "12px 0" }}>Order {order.id.slice(-8)}</h1>
      {order.redacted && <p style={{ color: "#666" }}>Read-only view: customer details are hidden for your role.</p>}
      {error && <p style={{ color: "#b00020" }} role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}

      <p>
        Placed {new Date(order.createdAt).toLocaleString()} · Payment: <strong>{order.status}</strong> · Fulfilment:{" "}
        <strong>{order.fulfilmentStatus}</strong>
        {order.disputeStatus && <span style={{ color: "#b00020" }}> · Dispute: {order.disputeStatus}</span>}
      </p>

      <h2 style={{ fontSize: 15, marginTop: 24 }}>Customer</h2>
      <p>
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

      <h2 style={{ fontSize: 15, marginTop: 24 }}>Items</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {order.items?.map((i) => (
            <tr key={i.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 6 }}>{i.qty} x {i.productName}</td>
              <td style={{ padding: 6 }}>{i.mode}</td>
              <td style={{ padding: 6, textAlign: "right" }}>${i.unitPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Subtotal ${order.subtotal} · Savings ${order.savings} · Shipping ${order.shipping} · <strong>Total ${order.total}</strong>
        {order.bonusSample && <> · Include the bonus sample</>}
      </p>
      {order.founding100Credit != null && (
        <p>
          Founding 100 credit: ${order.founding100Credit} ({order.founding100CreditIssuedAt ? "issued" : "owed"})
        </p>
      )}

      {editable && (
        <>
          <h2 style={{ fontSize: 15, marginTop: 24 }}>Fulfilment</h2>
          {order.status !== "paid" && next.length > 0 && <p style={{ color: "#666" }}>Unpaid: it cannot be packed or shipped yet.</p>}
          {showTracking && (
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr", maxWidth: 420, marginBottom: 12 }}>
              <label>
                Carrier
                <input value={carrier} onChange={(e) => setCarrier(e.target.value)} maxLength={80} style={field} disabled={order.fulfilmentStatus === "delivered"} />
              </label>
              <label>
                Tracking number
                <input value={tracking} onChange={(e) => setTracking(e.target.value)} maxLength={80} style={field} disabled={order.fulfilmentStatus === "delivered"} />
              </label>
              {order.fulfilmentStatus === "shipped" && (
                <button type="button" disabled={busy} onClick={() => patch({ trackingCarrier: carrier, trackingNumber: tracking }, "Tracking saved.")}>
                  Save tracking
                </button>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {next
              .filter((n) => order.status === "paid" || n === "cancelled" || n === "unfulfilled")
              .map((n) => (
                <button key={n} type="button" disabled={busy} onClick={() => move(n)}>
                  {LABEL[n] ?? n}
                </button>
              ))}
            {next.length === 0 && <span style={{ color: "#666" }}>This order is {order.fulfilmentStatus}; no further steps.</span>}
          </div>
          {order.shippedAt && <p>Shipped {new Date(order.shippedAt).toLocaleString()}</p>}
          {order.deliveredAt && <p>Delivered {new Date(order.deliveredAt).toLocaleString()}</p>}

          <h2 style={{ fontSize: 15, marginTop: 24 }}>Internal note</h2>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000} style={{ ...field, fontFamily: "inherit" }} />
          <button type="button" disabled={busy} onClick={() => patch({ internalNote: note }, "Note saved.")} style={{ marginTop: 8 }}>
            Save note
          </button>
        </>
      )}
    </div>
  );
}
