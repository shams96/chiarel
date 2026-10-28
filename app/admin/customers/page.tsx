"use client";

// Customer list. The API decides what each role may see (a Viewer gets masked
// emails, no search, no drill-down); this page only renders what it is given.
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
    <PageShell>
      <PageHeader
        eyebrow="Your clients"
        title="Customers"
        subtitle={
          <>
            People with at least one paid, not cancelled order. Lifetime value is gross USD, before refunds and fees.
            {role === "VIEWER" && " Read-only view: emails are masked for your role."}
          </>
        }
        actions={
          staff && (
            <Button variant="secondary" onClick={() => window.location.assign("/api/admin/customers/export")}>
              Export (CSV)
            </Button>
          )
        }
      />

      <div className="mb-6 flex flex-wrap items-end gap-4">
        {staff && (
          <Field label="Search" className="min-w-[14rem] flex-1">
            <input
              type="search"
              value={q}
              placeholder="Email or surname"
              onChange={(e) => setQ(e.target.value)}
              className={inputClass}
            />
          </Field>
        )}
        <Field label="Sort by">
          <select value={sort} onChange={(e) => setSort(e.target.value as "last" | "ltv")} className={inputClass}>
            <option value="last">Latest order</option>
            <option value="ltv">Lifetime value</option>
          </select>
        </Field>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {rows.length > 0 && (
        <Table head={["Customer", "Orders", "Lifetime value", "First order", "Last order", "Country", "Newsletter", "Plan"]}>
          {rows.flatMap((c) => {
            const main = (
              <tr key={c.email}>
                <td className={tdClass}>
                  {staff ? (
                    <button
                      type="button"
                      onClick={() => toggle(c.email)}
                      aria-expanded={open === c.email}
                      className="text-left text-garden underline underline-offset-4 hover:text-redochre"
                    >
                      {c.email}
                    </button>
                  ) : (
                    c.email
                  )}
                </td>
                <td className={`${tdClass} tabular-nums`}>{c.orders}</td>
                <td className={`${tdClass} font-serif text-[16px] tabular-nums`}>${c.ltv}</td>
                <td className={`${tdClass} whitespace-nowrap`}>{new Date(c.firstOrder).toLocaleDateString()}</td>
                <td className={`${tdClass} whitespace-nowrap`}>{new Date(c.lastOrder).toLocaleDateString()}</td>
                <td className={tdClass}>{c.country}</td>
                <td className={tdClass}>
                  <Badge tone={c.subscribed ? "ok" : "muted"}>{c.subscribed ? "yes" : "no"}</Badge>
                </td>
                <td className={tdClass}>
                  <Badge tone={c.hasPlan ? "ok" : "muted"}>{c.hasPlan ? "yes" : "no"}</Badge>
                </td>
              </tr>
            );
            if (open !== c.email) return [main];
            return [
              main,
              <tr key={`${c.email}-orders`}>
                <td colSpan={8} className="bg-peachdust/50 px-4 py-4">
                  {orders === null ? (
                    <Loading>Loading…</Loading>
                  ) : orders.length === 0 ? (
                    <p className="text-[14px]">No orders found.</p>
                  ) : (
                    <ul className="grid gap-2 text-[14px]">
                      {orders.map((o) => (
                        <li key={o.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <Link href={`/admin/orders/${o.id}`} className="font-medium text-garden underline underline-offset-4">
                            {o.id.slice(-8)}
                          </Link>
                          <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                          <span className="font-serif tabular-nums">${o.total}</span>
                          <Badge tone={statusTone(o.status)}>{o.status}</Badge>
                          <Badge tone={statusTone(o.fulfilmentStatus)}>{o.fulfilmentStatus}</Badge>
                          <span className="text-ink/75">{o.itemCount} item(s)</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>,
            ];
          })}
        </Table>
      )}

      {!loading && rows.length === 0 && !error && (
        <EmptyState
          title="No customers match"
          text="Customers appear here once they have a paid order. Try clearing the search."
        />
      )}
      {loading && rows.length === 0 && <Loading />}

      {next !== null && (
        <div className="mt-6">
          <Button variant="secondary" onClick={() => load(next)} disabled={loading}>
            {loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </PageShell>
  );
}
