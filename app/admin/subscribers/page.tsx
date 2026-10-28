"use client";

// Newsletter subscribers. The API decides what each role may see (a Viewer gets
// masked emails and no search) and who may unsubscribe; this page renders it.
// There is no "resubscribe": consent has to come from the person.
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Field,
  Loading,
  PageHeader,
  PageShell,
  Stat,
  StatGrid,
  Table,
  inputClass,
  statusTone,
  tdClass,
} from "@/components/admin/ui";

type Sub = {
  id: string;
  email: string;
  source: string;
  status: "active" | "unsubscribed";
  consentAt?: string;
  consentTextVersion?: string;
  createdAt: string;
  unsubscribedAt: string | null;
  redacted: boolean;
};
type Counts = { total: number; active: number; unsubscribed: number; bySource: { source: string; count: number }[] };

export default function AdminSubscribersPage() {
  const [rows, setRows] = useState<Sub[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => setRole(me?.role ?? null));
  }, []);

  const load = useCallback(
    async (after: string | null) => {
      setLoading(true);
      setError(null);
      const p = new URLSearchParams({ take: "50" });
      if (status) p.set("status", status);
      if (source) p.set("source", source);
      if (q.trim()) p.set("q", q.trim());
      if (after) p.set("cursor", after);
      const res = await fetch(`/api/admin/subscribers/list?${p}`);
      setLoading(false);
      if (!res.ok) return setError("Failed to load subscribers.");
      const json = await res.json();
      setRows((prev) => (after ? [...prev, ...json.subscribers] : json.subscribers));
      setCursor(json.nextCursor);
      setCounts(json.counts);
    },
    [status, source, q]
  );

  useEffect(() => {
    const t = setTimeout(() => load(null), q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  async function unsubscribe(s: Sub) {
    if (!window.confirm(`Unsubscribe ${s.email}? They can only be added back by signing up again themselves.`)) return;
    setError(null);
    setNotice(null);
    const res = await fetch(`/api/admin/subscribers/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unsubscribe" }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return setError(json.error ?? "Could not unsubscribe");
    setNotice(json.unchanged ? "They were already unsubscribed." : "Unsubscribed.");
    load(null);
  }

  const canEdit = role === "ADMIN" || role === "MEMBER";
  const viewer = role === "VIEWER";

  const head = ["Email", "Source", "Joined", ...(viewer ? [] : ["Consent"]), "Status", ...(canEdit ? [""] : [])];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Audience"
        title="Subscribers"
        subtitle="Everyone who has asked to hear from CHIAREL. People can only be added by signing up themselves."
        actions={
          role === "ADMIN" ? (
            <Button variant="secondary" onClick={() => window.location.assign("/api/admin/subscribers")}>
              Export CSV
            </Button>
          ) : undefined
        }
      />

      {counts && (
        <div className="mb-8">
          <StatGrid>
            <Stat label="Active" value={counts.active} tone="garden" />
            <Stat label="Unsubscribed" value={counts.unsubscribed} />
            <Stat label="Total" value={counts.total} tone="peach" />
          </StatGrid>
          {counts.bySource.length > 0 && (
            <p className="mt-4 text-[14px] text-ink/75">By source: {counts.bySource.map((b) => `${b.source} ${b.count}`).join(", ")}</p>
          )}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <Field label="Status" className="w-full sm:w-44">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </Field>
        <Field label="Source" className="w-full sm:w-44">
          <select value={source} onChange={(e) => setSource(e.target.value)} className={inputClass}>
            <option value="">All</option>
            {counts?.bySource.map((b) => (
              <option key={b.source} value={b.source}>
                {b.source}
              </option>
            ))}
          </select>
        </Field>
        {!viewer && (
          <Field label="Search email" className="min-w-[14rem] flex-1">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} className={inputClass} />
          </Field>
        )}
      </div>

      {viewer && <Alert kind="info">Read-only view: email addresses are masked for your role.</Alert>}
      {error && <Alert kind="error">{error}</Alert>}
      {notice && <Alert kind="success">{notice}</Alert>}

      {rows.length > 0 ? (
        <>
          <ul className="grid gap-3 md:hidden">
            {rows.map((s) => (
              <li key={s.id} className="border border-champagne bg-white p-4">
                <p className="break-all font-medium">{s.email}</p>
                <p className="mt-1 text-[13px] text-ink/75">
                  {s.source} · joined {new Date(s.createdAt).toLocaleDateString()}
                  {!viewer && s.consentAt ? ` · consent ${new Date(s.consentAt).toLocaleDateString()}${s.consentTextVersion ? ` (${s.consentTextVersion})` : ""}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span>
                    <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                    {s.unsubscribedAt && <span className="ml-2 text-[13px] text-ink/70">{new Date(s.unsubscribedAt).toLocaleDateString()}</span>}
                  </span>
                  {canEdit && s.status === "active" && (
                    <Button variant="secondary" small onClick={() => unsubscribe(s)}>
                      Unsubscribe
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden md:block">
            <Table head={head}>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className={tdClass}>{s.email}</td>
                  <td className={tdClass}>{s.source}</td>
                  <td className={`${tdClass} whitespace-nowrap`}>{new Date(s.createdAt).toLocaleDateString()}</td>
                  {!viewer && (
                    <td className={tdClass}>
                      {s.consentAt ? new Date(s.consentAt).toLocaleDateString() : ""} {s.consentTextVersion ? `(${s.consentTextVersion})` : ""}
                    </td>
                  )}
                  <td className={tdClass}>
                    <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                    {s.unsubscribedAt && <span className="ml-2 text-ink/70">{new Date(s.unsubscribedAt).toLocaleDateString()}</span>}
                  </td>
                  {canEdit && (
                    <td className={`${tdClass} text-right`}>
                      {s.status === "active" && (
                        <Button variant="secondary" small onClick={() => unsubscribe(s)}>
                          Unsubscribe
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </Table>
          </div>
        </>
      ) : loading ? (
        <Loading />
      ) : (
        !error && (
          <EmptyState
            title="No subscribers match."
            text="When someone signs up through the site, they will appear here with the date and wording they agreed to."
          />
        )
      )}

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
