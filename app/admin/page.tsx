"use client";

// Admin landing page. P0: who you are, what you can open, and (for Admins) the
// latest audit entries. Business metrics arrive with P1 (claudedocs/specs/admin-console/).
import { useEffect, useState } from "react";
import Link from "next/link";
import { auditLabel } from "@/components/admin/auditLabel";

type Role = "ADMIN" | "MEMBER" | "VIEWER";
type Entry = { id: string; createdAt: string; actorEmail: string; action: string; summary: string | null };

const SECTIONS: { href: string; title: string; text: string; roles: Role[] }[] = [
  { href: "/admin/founding100-credits", title: "Founding 100 credits", text: "Credits owed and issued.", roles: ["ADMIN", "MEMBER"] },
  { href: "/admin/users", title: "Users", text: "Add people, change roles, reset access.", roles: ["ADMIN"] },
  { href: "/admin/audit", title: "Audit log", text: "Who changed what, and when.", roles: ["ADMIN"] },
  { href: "/admin/account", title: "My account", text: "Change your password.", roles: ["ADMIN", "MEMBER", "VIEWER"] },
];

export default function AdminHomePage() {
  const [role, setRole] = useState<Role | null>(null);
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
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 24 }}>Admin</h1>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12, marginBottom: 32 }}>
        {SECTIONS.filter((s) => role && s.roles.includes(role)).map((s) => (
          <li key={s.href} style={{ border: "1px solid #ddd", padding: 12 }}>
            <Link href={s.href} style={{ fontWeight: 600 }}>
              {s.title}
            </Link>
            <p style={{ fontSize: 13, margin: "4px 0 0" }}>{s.text}</p>
          </li>
        ))}
      </ul>

      {role === "ADMIN" && (
        <>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Recent activity</h2>
          {recent === null ? (
            <p style={{ fontSize: 13 }}>Loading…</p>
          ) : recent.length === 0 ? (
            <p style={{ fontSize: 13 }}>Nothing recorded yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, fontSize: 13, display: "grid", gap: 6 }}>
              {recent.map((e) => (
                <li key={e.id}>
                  <time dateTime={e.createdAt}>{new Date(e.createdAt).toLocaleString()}</time> · {e.actorEmail} ·{" "}
                  {auditLabel(e)}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
