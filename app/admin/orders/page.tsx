"use client";

// Order list. The API decides what each role may see (a Viewer gets a redacted
// shape); this page only renders what it is given.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  PageShell,
  PageHeader,
  Alert,
  Badge,
  Button,
  EmptyState,
  Field,
  inputClass,
  Loading,
  statusTone,
  Table,
  tdClass,
} from "@/components/admin/ui";

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
    <PageShell>
      <PageHeader
        eyebrow="Fulfilment"
        title="Orders"
        subtitle="Find an order, then pack it, ship it with tracking, and see it through to delivery."
        actions={
          canExport && (
            <Button variant="secondary" onClick={() => window.location.assign("/api/admin/orders/export")}>
              Export to ship (CSV)
            </Button>
          )
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,2fr)]">
        <Field label="Fulfilment">
          <select value={fulfilment} onChange={(e) => setFulfilment(e.target.value)} className={inputClass}>
            {FULFILMENT.map((f) => (
              <option key={f} value={f}>
                {f || "All"}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Payment">
          <select value={payment} onChange={(e) => setPayment(e.target.value)} className={inputClass}>
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </Field>
        <Field label="From">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
        </Field>
        <Field label="To">
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Search" className="sm:col-span-2 lg:col-span-1">
          <input
            type="search"
            value={q}
            placeholder="Order id, email, surname, tracking"
            onChange={(e) => setQ(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {rows.length > 0 && (
        <Table head={["Order", "Placed", "Customer", "Country", "Total", "Payment", "Fulfilment"]}>
          {rows.map((o) => (
            <tr key={o.id}>
              <td className={`${tdClass} whitespace-nowrap`}>
                <Link href={`/admin/orders/${o.id}`} className="font-medium text-garden underline underline-offset-4 hover:text-redochre">
                  {o.id.slice(-8)}
                </Link>
                {o.disputeStatus && (
                  <span className="ml-2 align-middle">
                    <Badge tone="danger">dispute</Badge>
                  </span>
                )}
              </td>
              <td className={`${tdClass} whitespace-nowrap`}>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td className={tdClass}>
                {o.name ? `${o.name} ` : ""}
                <span className="text-ink/75">{o.email}</span>
              </td>
              <td className={tdClass}>{o.country}</td>
              <td className={`${tdClass} font-serif text-[16px] tabular-nums`}>${o.total}</td>
              <td className={tdClass}>
                <Badge tone={statusTone(o.status)}>{o.status}</Badge>
              </td>
              <td className={tdClass}>
                <Badge tone={statusTone(o.fulfilmentStatus)}>{o.fulfilmentStatus}</Badge>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {!loading && rows.length === 0 && !error && (
        <EmptyState
          title="No orders match"
          text="New orders show up here the moment they are placed. Try clearing a filter or the search."
        />
      )}
      {loading && rows.length === 0 && <Loading />}

      {cursor && (
        <div className="mt-6">
          <Button variant="secondary" onClick={() => load(cursor)} disabled={loading}>
            {loading ? "Loading…" : "Load older"}
          </Button>
        </div>
      )}
    </PageShell>
  );
}
