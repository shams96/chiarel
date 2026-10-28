"use client";

// Frame for the internal admin console: Formal Garden header with the CHIAREL
// wordmark, pill navigation, and a strip of the printed Red Ochre ribbon on the
// edge. The links shown depend on the role returned by /api/admin/me, but that
// is only a convenience: every API route enforces its own role, so a hidden link
// is never the security boundary. The public header and footer are not rendered
// on /admin (components/HideOnAdmin.tsx).
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import RibbonBand from "@/components/home/RibbonBand";
import { Loading } from "@/components/admin/ui";

type Role = "ADMIN" | "MEMBER" | "VIEWER";
type Me = { email: string; role: Role };

const NAV: { href: string; label: string; roles: Role[] }[] = [
  { href: "/admin", label: "Dashboard", roles: ["ADMIN", "MEMBER", "VIEWER"] },
  { href: "/admin/orders", label: "Orders", roles: ["ADMIN", "MEMBER", "VIEWER"] },
  { href: "/admin/customers", label: "Customers", roles: ["ADMIN", "MEMBER", "VIEWER"] },
  { href: "/admin/subscribers", label: "Subscribers", roles: ["ADMIN", "MEMBER", "VIEWER"] },
  { href: "/admin/disputes", label: "Disputes", roles: ["ADMIN", "MEMBER"] },
  { href: "/admin/founding100-credits", label: "Founding 100", roles: ["ADMIN", "MEMBER"] },
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

  if (isLogin) return <div className="min-h-screen bg-ivory">{children}</div>;
  if (!checked) {
    return (
      <div className="min-h-screen bg-ivory px-6">
        <Loading />
      </div>
    );
  }

  async function signOut() {
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <header className="bg-garden text-ivory">
        <div className="mx-auto flex max-w-[84rem] flex-wrap items-center gap-x-6 gap-y-3 px-[clamp(1rem,3vw,3rem)] py-4">
          <Link href="/admin" className="flex items-baseline gap-3" aria-label="CHIAREL admin home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/brand/CHIAREL_Wordmark_PeachDust.svg" alt="CHIAREL" className="h-6 w-auto md:h-7" />
            <span className="text-[10px] uppercase tracking-[0.34em] text-champagne">Admin</span>
          </Link>
          <div className="ml-auto flex items-center gap-4 text-[12px]">
            <span className="hidden text-ivory/85 sm:inline">{me ? `${me.email} · ${me.role}` : ""}</span>
            <button
              type="button"
              onClick={signOut}
              className="btn-press border border-champagne px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-champagne transition hover:bg-champagne hover:text-ink"
            >
              Sign out
            </button>
          </div>
          <nav aria-label="Admin" className="-mx-1 flex w-full gap-1 overflow-x-auto px-1 pb-1">
            {NAV.filter((n) => me && n.roles.includes(me.role)).map((n) => {
              const here = pathname === n.href || (n.href !== "/admin" && pathname.startsWith(`${n.href}/`));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={here ? "page" : undefined}
                  className={
                    "whitespace-nowrap px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition " +
                    (here ? "bg-champagne text-ink" : "text-ivory/90 hover:bg-ivory/10")
                  }
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <RibbonBand tone="redochre" />
      <main>{children}</main>
      <footer className="mt-16 border-t border-champagne px-6 py-8 text-center text-[11px] uppercase tracking-[0.3em] text-ink/60">
        CHIAREL™ · The House of Clarity™ · Admin
      </footer>
    </div>
  );
}
