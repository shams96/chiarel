"use client";

// Customer list. The API decides what each role may see (a Viewer gets masked
// emails, no search, no drill-down); this page only renders what it is given.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Customer = {
  email: string;
  orders: number;
  ltv: number;
  firstOrder: string;
  lastOrder: string;
  country: string;
  subscribed: boolean;
  hasPlan: boolean;
  redacted: boolean;
};
type OrderRow = { id: string; createdAt: string; total: number; status: string; fulfilmentStatus: string; itemCount: number };

const cell = { padding: 8 } as const;

export default function AdminCustomersPage() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [next, setNext] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"last" | "ltv">("last");
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => setRole(me?.role ?? null));
  }, []);

  const load = useCallback(
    async (offset: number) => {
      setLoading(true);
      setError(null);
      const p = new URLSearchParams({ take: "50", sort });
      if (q.trim()) p.set("q", q.trim());
      if (offset) p.set("offset", String(offset));
      const res = await fetch(`/api/admin/customers?${p}`);
      setLoading(false);
      if (!res.ok) return setError("Failed to load customers.");
      const json = await res.json();
      setRows((prev) => (offset ? [...prev, ...json.customers] : json.customers));
      setNext(json.nextOffset);
    },
    [q, sort]
  );

  useEffect(() => {
    const t = setTimeout(() => load(0), q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const staff = role === "ADMIN" || role === "MEMBER";

  async function toggle(email: string) {
    if (open === email) return setOpen(null);
    setOpen(email);
    setOrders(null);
    const res = await fetch("/api/admin/customers/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setOrders(res.ok ? (await res.json()).orders : []);
  }

  return (
    <div style={{ maxWidth: 1040, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Customers</h1>
      <p style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>
        People with at least one paid, not cancelled order. Lifetime value is gross USD, before refunds and fees.
        {role === "VIEWER" && " Read-only view: emails are masked for your role."}
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 16, fontSize: 12 }}>
        {staff && (
          <label style={{ flex: "1 1 220px" }}>
            Search
            <input
              type="search"
              value={q}
              placeholder="Email or surname"
              onChange={(e) => setQ(e.target.value)}
              style={{ display: "block", padding: 4, width: "100%" }}
            />
          </label>
        )}
        <label>
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value as "last" | "ltv")} style={{ display: "block", padding: 4 }}>
            <option value="last">Latest order</option>
            <option value="ltv">Lifetime value</option>
          </select>
        </label>
        {staff && (
          <button type="button" onClick={() => window.location.assign("/api/admin/customers/export")}>
            Export (CSV)
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
            <th style={cell}>Customer</th>
            <th style={cell}>Orders</th>
            <th style={cell}>Lifetime value</th>
            <th style={cell}>First order</th>
            <th style={cell}>Last order</th>
            <th style={cell}>Country</th>
            <th style={cell}>Newsletter</th>
            <th style={cell}>Plan</th>
          </tr>
        </thead>
        <tbody>
          {rows.flatMap((c) => {
            const main = (
              <tr key={c.email} style={{ borderBottom: "1px solid #eee" }}>
                <td style={cell}>
                  {staff ? (
                    <button type="button" onClick={() => toggle(c.email)} aria-expanded={open === c.email} style={{ background: "none", border: 0, padding: 0, cursor: "pointer", textDecoration: "underline" }}>
                      {c.email}
                    </button>
                  ) : (
                    c.email
                  )}
                </td>
                <td style={cell}>{c.orders}</td>
                <td style={cell}>${c.ltv}</td>
                <td style={{ ...cell, whiteSpace: "nowrap" }}>{new Date(c.firstOrder).toLocaleDateString()}</td>
                <td style={{ ...cell, whiteSpace: "nowrap" }}>{new Date(c.lastOrder).toLocaleDateString()}</td>
                <td style={cell}>{c.country}</td>
                <td style={cell}>{c.subscribed ? "yes" : "no"}</td>
                <td style={cell}>{c.hasPlan ? "yes" : "no"}</td>
              </tr>
            );
            if (open !== c.email) return [main];
            return [
              main,
              <tr key={`${c.email}-orders`}>
                <td colSpan={8} style={{ ...cell, background: "#fafafa" }}>
                  {orders === null ? (
                    "Loading…"
                  ) : orders.length === 0 ? (
                    "No orders found."
                  ) : (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 4 }}>
                      {orders.map((o) => (
                        <li key={o.id}>
                          <Link href={`/admin/orders/${o.id}`}>{o.id.slice(-8)}</Link> · {new Date(o.createdAt).toLocaleDateString()} · ${o.total} · {o.status} / {o.fulfilmentStatus} · {o.itemCount} item(s)
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>,
            ];
          })}
        </tbody>
      </table>
      {!loading && rows.length === 0 && !error && <p style={{ fontSize: 13 }}>No customers match.</p>}
      {next !== null && (
        <button type="button" onClick={() => load(next)} disabled={loading} style={{ marginTop: 16 }}>
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
