"use client";

// Admin dashboard: sales, what needs doing, subscribers, and (for Admins) the
// latest audit entries. Numbers come from /api/admin/dashboard (aggregates only).
import { useEffect, useState } from "react";
import Link from "next/link";
import { auditLabel } from "@/components/admin/auditLabel";

type Role = "ADMIN" | "MEMBER" | "VIEWER";
type Entry = { id: string; createdAt: string; actorEmail: string; action: string; summary: string | null };
type Win = { orders: number; revenue: number; averageOrder: number };
type Dash = {
  paymentsMode: "test" | "live" | "unknown";
  sales: { today: Win; last7: Win; last30: Win };
  fulfilment: { toPack: number; packedNotShipped: number; oldestUnfulfilledDays: number | null; shippedLast30: number };
  disputes: { open: number; amount: number };
  credits: { owedCount: number; owedAmount: number };
  subscribers: { active: number; newLast30: number; unsubscribedLast30: number };
};

const SECTIONS: { href: string; title: string; text: string; roles: Role[] }[] = [
  { href: "/admin/orders", title: "Orders", text: "Find, pack, ship and track orders.", roles: ["ADMIN", "MEMBER", "VIEWER"] },
  { href: "/admin/customers", title: "Customers", text: "Who buys, how often, lifetime value.", roles: ["ADMIN", "MEMBER", "VIEWER"] },
  { href: "/admin/subscribers", title: "Subscribers", text: "Newsletter list and opt-outs.", roles: ["ADMIN", "MEMBER", "VIEWER"] },
  { href: "/admin/disputes", title: "Disputes", text: "Chargebacks, evidence checklist, dispute rate.", roles: ["ADMIN", "MEMBER"] },
  { href: "/admin/founding100-credits", title: "Founding 100 credits", text: "Credits owed and issued.", roles: ["ADMIN", "MEMBER"] },
  { href: "/admin/users", title: "Users", text: "Add people, change roles, reset access.", roles: ["ADMIN"] },
  { href: "/admin/audit", title: "Audit log", text: "Who changed what, and when.", roles: ["ADMIN"] },
  { href: "/admin/account", title: "My account", text: "Change your password.", roles: ["ADMIN", "MEMBER", "VIEWER"] },
];

const orderCount = (n: number) => `${n} ${n === 1 ? "order" : "orders"}`;
const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function Tile({ label, value, sub, href }: { label: string; value: string; sub?: string; href?: string }) {
  const body = (
    <>
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#666" }}>{sub}</div>}
    </>
  );
  const box = { border: "1px solid #ddd", padding: 12, display: "block", color: "inherit", textDecoration: "none" } as const;
  return href ? (
    <Link href={href} style={box}>
      {body}
    </Link>
  ) : (
    <div style={box}>{body}</div>
  );
}

export default function AdminHomePage() {
  const [role, setRole] = useState<Role | null>(null);
  const [dash, setDash] = useState<Dash | null>(null);
  const [failed, setFailed] = useState(false);
  const [recent, setRecent] = useState<Entry[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        if (!me) return;
        setRole(me.role);
        if (me.role === "ADMIN") {
          fetch("/api/admin/audit?take=8")
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => j && setRecent(j.entries));
        }
      });
    fetch("/api/admin/dashboard")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setDash)
      .catch(() => setFailed(true));
  }, []);

  const s = dash?.sales;
  return (
    <div style={{ maxWidth: 860, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Dashboard</h1>
      {dash?.paymentsMode === "test" && (
        <p style={{ fontSize: 13, background: "#fff4d6", padding: 8, marginBottom: 16 }}>
          Payments are in <strong>test mode</strong>: orders and revenue below are not real money.
        </p>
      )}
      {failed && (
        <p style={{ color: "#b00020", fontSize: 13 }} role="alert">
          Could not load the numbers. Try again in a moment.
        </p>
      )}

      {dash && s && (
        <>
          <h2 style={{ fontSize: 15, margin: "16px 0 8px" }}>Sales (paid, not cancelled; days are UTC)</h2>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
            <Tile label="Today" value={money(s.today.revenue)} sub={orderCount(s.today.orders)} />
            <Tile label="Last 7 days" value={money(s.last7.revenue)} sub={`${orderCount(s.last7.orders)} · avg ${money(s.last7.averageOrder)}`} />
            <Tile label="Last 30 days" value={money(s.last30.revenue)} sub={`${orderCount(s.last30.orders)} · avg ${money(s.last30.averageOrder)}`} />
          </div>

          <h2 style={{ fontSize: 15, margin: "24px 0 8px" }}>Needs attention</h2>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
            <Tile
              label="To pack"
              value={String(dash.fulfilment.toPack)}
              sub={dash.fulfilment.oldestUnfulfilledDays != null ? `oldest ${dash.fulfilment.oldestUnfulfilledDays} day(s) old` : "all caught up"}
              href="/admin/orders?fulfilment=unfulfilled&payment=paid"
            />
            <Tile label="Packed, not shipped" value={String(dash.fulfilment.packedNotShipped)} href="/admin/orders?fulfilment=packed&payment=paid" />
            <Tile
              label="Open disputes"
              value={String(dash.disputes.open)}
              sub={dash.disputes.open ? money(dash.disputes.amount) : undefined}
              href={role === "VIEWER" ? undefined : "/admin/disputes"}
            />
            {(role === "ADMIN" || role === "MEMBER") && (
              <Tile
                label="Founding 100 credits owed"
                value={String(dash.credits.owedCount)}
                sub={dash.credits.owedCount ? money(dash.credits.owedAmount) : undefined}
                href="/admin/founding100-credits"
              />
            )}
          </div>

          <h2 style={{ fontSize: 15, margin: "24px 0 8px" }}>Audience</h2>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
            <Tile label="Subscribers" value={String(dash.subscribers.active)} href="/admin/subscribers" />
            <Tile label="New, last 30 days" value={String(dash.subscribers.newLast30)} />
            <Tile label="Unsubscribed, last 30 days" value={String(dash.subscribers.unsubscribedLast30)} />
            <Tile label="Shipped, last 30 days" value={String(dash.fulfilment.shippedLast30)} />
          </div>
        </>
      )}

      <h2 style={{ fontSize: 15, margin: "24px 0 8px" }}>Go to</h2>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8, marginBottom: 32 }}>
        {SECTIONS.filter((x) => role && x.roles.includes(role)).map((x) => (
          <li key={x.href} style={{ border: "1px solid #ddd", padding: 10 }}>
            <Link href={x.href} style={{ fontWeight: 600 }}>
              {x.title}
            </Link>
            <span style={{ fontSize: 13, marginLeft: 8 }}>{x.text}</span>
          </li>
        ))}
      </ul>

      {role === "ADMIN" && (
        <>
          <h2 style={{ fontSize: 15, marginBottom: 8 }}>Recent activity</h2>
          {recent === null ? (
            <p style={{ fontSize: 13 }}>Loading…</p>
          ) : recent.length === 0 ? (
            <p style={{ fontSize: 13 }}>Nothing recorded yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, fontSize: 13, display: "grid", gap: 6 }}>
              {recent.map((e) => (
                <li key={e.id}>
                  <time dateTime={e.createdAt}>{new Date(e.createdAt).toLocaleString()}</time> · {e.actorEmail} · {auditLabel(e)}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
