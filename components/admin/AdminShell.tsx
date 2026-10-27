"use client";

// Navigation frame for the internal admin console. Plain styling on purpose
// (see claudedocs/specs/admin-rbac/PLAN.md). The links shown depend on the role
// returned by /api/admin/me, but that is only a convenience: every API route
// enforces its own role, so a hidden link is never the security boundary.
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type Role = "ADMIN" | "MEMBER" | "VIEWER";
type Me = { email: string; role: Role };

const NAV: { href: string; label: string; roles: Role[] }[] = [
  { href: "/admin", label: "Dashboard", roles: ["ADMIN", "MEMBER", "VIEWER"] },
  { href: "/admin/orders", label: "Orders", roles: ["ADMIN", "MEMBER", "VIEWER"] },
  { href: "/admin/founding100-credits", label: "Founding 100 credits", roles: ["ADMIN", "MEMBER"] },
  { href: "/admin/users", label: "Users", roles: ["ADMIN"] },
  { href: "/admin/audit", label: "Audit log", roles: ["ADMIN"] },
  { href: "/admin/account", label: "My account", roles: ["ADMIN", "MEMBER", "VIEWER"] },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [checked, setChecked] = useState(false);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    let live = true;
    fetch("/api/admin/me")
      .then(async (res) => {
        if (!live) return;
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (res.ok) setMe(await res.json());
        setChecked(true);
      })
      .catch(() => live && setChecked(true));
    return () => {
      live = false;
    };
  }, [isLogin, router]);

  if (isLogin) return <>{children}</>;
  if (!checked) return <p style={{ padding: 32, fontFamily: "system-ui, sans-serif", fontSize: 13 }}>Loading…</p>;

  async function signOut() {
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <nav
        aria-label="Admin"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 16,
          padding: "12px 24px",
          borderBottom: "1px solid #ddd",
          fontSize: 13,
        }}
      >
        {NAV.filter((n) => me && n.roles.includes(me.role)).map((n) => {
          const here = pathname === n.href || (n.href !== "/admin" && pathname.startsWith(`${n.href}/`));
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={here ? "page" : undefined}
              style={{ fontWeight: here ? 700 : 400, textDecoration: "none", color: "inherit" }}
            >
              {n.label}
            </Link>
          );
        })}
        <span style={{ marginLeft: "auto" }}>
          {me ? `${me.email} · ${me.role}` : ""}
        </span>
        <button type="button" onClick={signOut}>
          Sign out
        </button>
      </nav>
      {children}
    </div>
  );
}
