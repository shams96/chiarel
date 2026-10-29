"use client";

// Admin dashboard: a warm welcome, sales, what needs doing, audience, and (for
// Admins) the latest audit entries. Numbers come from /api/admin/dashboard
// (aggregates only, no personal data). Styling: components/admin/ui.tsx.
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { auditLabel } from "@/components/admin/auditLabel";
import { Alert, Card, EmptyState, Loading, PageShell, SectionTitle, Stat, StatGrid } from "@/components/admin/ui";

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

function greeting(email: string | null) {
  const h = new Date().getHours();
  const part = h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
  const raw = (email ?? "").split("@")[0].split(/[._-]/)[0].replace(/\d+$/, "");
  const name = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "";
  return name ? `Good ${part}, ${name}.` : `Good ${part}.`;
}

export default function AdminHomePage() {
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [dash, setDash] = useState<Dash | null>(null);
  const [failed, setFailed] = useState(false);
  const [recent, setRecent] = useState<Entry[] | null>(null);
  const [hello, setHello] = useState("Welcome.");

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        if (!me) return;
        setRole(me.role);
        setEmail(me.email);
        setHello(greeting(me.email));
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
  const summary = dash
    ? [
        dash.fulfilment.toPack ? `${dash.fulfilment.toPack} to pack` : null,
        dash.fulfilment.packedNotShipped ? `${dash.fulfilment.packedNotShipped} ready to ship` : null,
        dash.disputes.open ? `${dash.disputes.open} open ${dash.disputes.open === 1 ? "dispute" : "disputes"}` : null,
      ].filter(Boolean)
    : [];

  return (
    <PageShell>
      <section className="grid overflow-hidden bg-garden text-ivory md:grid-cols-[3fr_2fr]">
        <div className="p-7 md:p-12">
          <p className="text-[11px] uppercase tracking-[0.34em] text-champagne">Admin console</p>
          <h1 className="mt-3 font-serif text-[clamp(2.2rem,1.2rem+3vw,4rem)] leading-[1.05]">{hello}</h1>
          <p className="mt-4 max-w-xl text-[clamp(1rem,0.9rem+0.3vw,1.2rem)] leading-relaxed text-ivory/90">
            {dash
              ? summary.length
                ? `Today at a glance: ${summary.join(", ")}.`
                : "Everything is caught up. Nothing is waiting on you."
              : "Here is how the House is doing."}
          </p>
          {role && role !== "VIEWER" && (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/admin/orders?fulfilment=unfulfilled&payment=paid"
                className="btn-press inline-flex bg-champagne px-6 py-3 text-[11px] uppercase tracking-[0.24em] text-ink transition hover:bg-champagne/85"
              >
                Orders to pack
              </Link>
              <Link
                href="/admin/orders"
                className="btn-press inline-flex border border-champagne px-6 py-3 text-[11px] uppercase tracking-[0.24em] text-champagne transition hover:bg-champagne hover:text-ink"
              >
                All orders
              </Link>
            </div>
          )}
        </div>
        <div className="relative hidden min-h-[18rem] md:block">
          <Image
            src="/assets/products/clarity-neck-decollete-creme-festive-scene-v2.jpg"
            alt=""
            fill
            priority
            sizes="40vw"
            className="object-cover object-[50%_78%]"
          />
        </div>
      </section>

      <div className="mt-8">
        {dash?.paymentsMode === "test" && (
          <Alert kind="info">
            Payments are in <strong>test mode</strong>: orders and revenue below are not real money.
          </Alert>
        )}
        {failed && <Alert kind="error">Could not load the numbers. Try again in a moment.</Alert>}
      </div>

      {!dash && !failed && <Loading />}

      {dash && s && (
        <>
          <SectionTitle hint="Paid, not cancelled. Days are UTC.">Sales</SectionTitle>
          <StatGrid>
            <Stat tone="redochre" label="Today" value={money(s.today.revenue)} sub={orderCount(s.today.orders)} />
            <Stat tone="garden" label="Last 7 days" value={money(s.last7.revenue)} sub={`${orderCount(s.last7.orders)} · avg ${money(s.last7.averageOrder)}`} />
            <Stat tone="champagne" label="Last 30 days" value={money(s.last30.revenue)} sub={`${orderCount(s.last30.orders)} · avg ${money(s.last30.averageOrder)}`} />
          </StatGrid>

          <SectionTitle>Needs attention</SectionTitle>
          <StatGrid>
            <Stat
              label="To pack"
              value={dash.fulfilment.toPack}
              sub={dash.fulfilment.oldestUnfulfilledDays != null ? `oldest ${dash.fulfilment.oldestUnfulfilledDays} day(s) old` : "all caught up"}
              href="/admin/orders?fulfilment=unfulfilled&payment=paid"
            />
            <Stat label="Packed, not shipped" value={dash.fulfilment.packedNotShipped} href="/admin/orders?fulfilment=packed&payment=paid" />
            <Stat
              tone={dash.disputes.open > 0 ? "redochre" : "white"}
              label="Open disputes"
              value={dash.disputes.open}
              sub={dash.disputes.open ? money(dash.disputes.amount) : "none open"}
              href={role === "VIEWER" ? undefined : "/admin/disputes"}
            />
            {(role === "ADMIN" || role === "MEMBER") && (
              <Stat
                label="Founding 100 credits owed"
                value={dash.credits.owedCount}
                sub={dash.credits.owedCount ? money(dash.credits.owedAmount) : "none owed"}
                href="/admin/founding100-credits"
              />
            )}
          </StatGrid>

          <SectionTitle>Audience</SectionTitle>
          <StatGrid>
            <Stat label="Subscribers" value={dash.subscribers.active} href="/admin/subscribers" />
            <Stat label="New, last 30 days" value={dash.subscribers.newLast30} />
            <Stat label="Unsubscribed, last 30 days" value={dash.subscribers.unsubscribedLast30} />
            <Stat label="Shipped, last 30 days" value={dash.fulfilment.shippedLast30} />
          </StatGrid>
        </>
      )}

      <SectionTitle>Go to</SectionTitle>
      <ul className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,17rem),1fr))]">
        {SECTIONS.filter((x) => role && x.roles.includes(role)).map((x) => (
          <li key={x.href}>
            <Link
              href={x.href}
              className="group block h-full border border-champagne border-t-redochre bg-white p-5 transition-transform duration-300 ease-out hover:-translate-y-0.5"
            >
              <span className="font-serif text-xl text-garden group-hover:underline group-hover:decoration-champagne group-hover:underline-offset-4">
                {x.title}
              </span>
              <span className="mt-1.5 block text-[14px] text-ink/75">{x.text}</span>
            </Link>
          </li>
        ))}
      </ul>

      {role === "ADMIN" && (
        <>
          <SectionTitle>Recent activity</SectionTitle>
          {recent === null ? (
            <Loading />
          ) : recent.length === 0 ? (
            <EmptyState title="Nothing recorded yet" text="Actions taken in the console will appear here." />
          ) : (
            <Card tone="white" className="!p-0">
              <ul className="divide-y divide-champagne/50">
                {recent.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-3 text-[14px]">
                    <time dateTime={e.createdAt} className="w-44 shrink-0 text-[12px] text-ink/65">
                      {new Date(e.createdAt).toLocaleString()}
                    </time>
                    <span className="text-ink/75">{e.actorEmail}</span>
                    <span className="font-medium text-garden">{auditLabel(e)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
      {email && <p className="sr-only">Signed in as {email}</p>}
    </PageShell>
  );
}
