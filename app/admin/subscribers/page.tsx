"use client";

// Newsletter subscribers. The API decides what each role may see (a Viewer gets
// masked emails and no search) and who may unsubscribe; this page renders it.
// There is no "resubscribe": consent has to come from the person.
import { useCallback, useEffect, useState } from "react";

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

const cell = { padding: 8 } as const;

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

  return (
    <div style={{ maxWidth: 1040, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Subscribers</h1>
      {counts && (
        <p style={{ fontSize: 13, marginBottom: 16 }}>
          <strong>{counts.active}</strong> active · {counts.unsubscribed} unsubscribed · {counts.total} total
          {counts.bySource.length > 0 && <> · by source: {counts.bySource.map((b) => `${b.source} ${b.count}`).join(", ")}</>}
        </p>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 16, fontSize: 12 }}>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ display: "block", padding: 4 }}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </label>
        <label>
          Source
          <select value={source} onChange={(e) => setSource(e.target.value)} style={{ display: "block", padding: 4 }}>
            <option value="">All</option>
            {counts?.bySource.map((b) => (
              <option key={b.source} value={b.source}>
                {b.source}
              </option>
            ))}
          </select>
        </label>
        {!viewer && (
          <label style={{ flex: "1 1 200px" }}>
            Search email
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} style={{ display: "block", padding: 4, width: "100%" }} />
          </label>
        )}
        {role === "ADMIN" && (
          <button type="button" onClick={() => window.location.assign("/api/admin/subscribers")}>
            Export CSV
          </button>
        )}
      </div>
      {viewer && <p style={{ fontSize: 12, color: "#666" }}>Read-only view: email addresses are masked for your role.</p>}
      {error && (
        <p style={{ color: "#b00020", fontSize: 13 }} role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p style={{ fontSize: 13 }} role="status">
          {notice}
        </p>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
            <th style={cell}>Email</th>
            <th style={cell}>Source</th>
            <th style={cell}>Joined</th>
            {!viewer && <th style={cell}>Consent</th>}
            <th style={cell}>Status</th>
            {canEdit && <th style={cell}></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={cell}>{s.email}</td>
              <td style={cell}>{s.source}</td>
              <td style={{ ...cell, whiteSpace: "nowrap" }}>{new Date(s.createdAt).toLocaleDateString()}</td>
              {!viewer && (
                <td style={cell}>
                  {s.consentAt ? new Date(s.consentAt).toLocaleDateString() : ""} {s.consentTextVersion ? `(${s.consentTextVersion})` : ""}
                </td>
              )}
              <td style={cell}>
                {s.status}
                {s.unsubscribedAt && <span style={{ color: "#666" }}> {new Date(s.unsubscribedAt).toLocaleDateString()}</span>}
              </td>
              {canEdit && (
                <td style={cell}>
                  {s.status === "active" && (
                    <button type="button" onClick={() => unsubscribe(s)}>
                      Unsubscribe
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && rows.length === 0 && !error && <p style={{ fontSize: 13 }}>No subscribers match.</p>}
      {cursor && (
        <button type="button" onClick={() => load(cursor)} disabled={loading} style={{ marginTop: 16 }}>
          {loading ? "Loading…" : "Load older"}
        </button>
      )}
    </div>
  );
}
