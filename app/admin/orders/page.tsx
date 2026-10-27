"use client";

// Order list. The API decides what each role may see (a Viewer gets a redacted
// shape); this page only renders what it is given.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  id: string;
  createdAt: string;
  name: string | null;
  email: string;
  country: string;
  total: number;
  status: string;
  fulfilmentStatus: string;
  disputeStatus: string | null;
  itemCount: number;
};

const FULFILMENT = ["", "unfulfilled", "packed", "shipped", "delivered", "cancelled"];
const cell = { padding: 8 } as const;

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [fulfilment, setFulfilment] = useState("");
  const [payment, setPayment] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [canExport, setCanExport] = useState(false);
  // Dashboard tiles link here with ?fulfilment=...; apply it before the first load.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get("fulfilment");
    if (f && FULFILMENT.includes(f)) setFulfilment(f);
    const pay = params.get("payment");
    if (pay === "paid" || pay === "pending") setPayment(pay);
    setReady(true);
  }, []);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => setCanExport(me?.role === "ADMIN" || me?.role === "MEMBER"));
  }, []);

  const load = useCallback(
    async (after: string | null) => {
      setLoading(true);
      setError(null);
      const p = new URLSearchParams({ take: "50" });
      if (fulfilment) p.set("fulfilment", fulfilment);
      if (payment) p.set("payment", payment);
      if (q.trim()) p.set("q", q.trim());
      if (from) p.set("from", from);
      if (to) p.set("to", to);
      if (after) p.set("cursor", after);
      const res = await fetch(`/api/admin/orders?${p}`);
      setLoading(false);
      if (!res.ok) return setError("Failed to load orders.");
      const json = await res.json();
      setRows((prev) => (after ? [...prev, ...json.orders] : json.orders));
      setCursor(json.nextCursor);
    },
    [fulfilment, payment, q, from, to]
  );

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => load(null), q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q, ready]);

  return (
    <div style={{ maxWidth: 1040, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Orders</h1>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 16, fontSize: 12 }}>
        <label>
          Fulfilment
          <select value={fulfilment} onChange={(e) => setFulfilment(e.target.value)} style={{ display: "block", padding: 4 }}>
            {FULFILMENT.map((f) => (
              <option key={f} value={f}>
                {f || "All"}
              </option>
            ))}
          </select>
        </label>
        <label>
          Payment
          <select value={payment} onChange={(e) => setPayment(e.target.value)} style={{ display: "block", padding: 4 }}>
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </label>
        <label>
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ display: "block", padding: 4 }} />
        </label>
        <label>
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ display: "block", padding: 4 }} />
        </label>
        <label style={{ flex: "1 1 200px" }}>
          Search
          <input
            type="search"
            value={q}
            placeholder="Order id, email, surname, tracking"
            onChange={(e) => setQ(e.target.value)}
            style={{ display: "block", padding: 4, width: "100%" }}
          />
        </label>
        {canExport && (
          <button type="button" onClick={() => window.location.assign("/api/admin/orders/export")}>
            Export to ship (CSV)
          </button>
        )}
      </div>

      {error && (
        <p style={{ color: "#b00020", fontSize: 13 }} role="alert">
          {error}
        </p>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
            <th style={cell}>Order</th>
            <th style={cell}>Placed</th>
            <th style={cell}>Customer</th>
            <th style={cell}>Country</th>
            <th style={cell}>Total</th>
            <th style={cell}>Payment</th>
            <th style={cell}>Fulfilment</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={cell}>
                <Link href={`/admin/orders/${o.id}`}>{o.id.slice(-8)}</Link>
                {o.disputeStatus && <span style={{ color: "#b00020" }}> · dispute</span>}
              </td>
              <td style={{ ...cell, whiteSpace: "nowrap" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td style={cell}>
                {o.name ? `${o.name} ` : ""}
                <span style={{ color: "#666" }}>{o.email}</span>
              </td>
              <td style={cell}>{o.country}</td>
              <td style={cell}>${o.total}</td>
              <td style={cell}>{o.status}</td>
              <td style={cell}>{o.fulfilmentStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && rows.length === 0 && !error && <p style={{ fontSize: 13 }}>No orders match.</p>}
      {cursor && (
        <button type="button" onClick={() => load(cursor)} disabled={loading} style={{ marginTop: 16 }}>
          {loading ? "Loading…" : "Load older"}
        </button>
      )}
    </div>
  );
}
