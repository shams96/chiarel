"use client";

// The admin console has its own frame (components/admin/AdminShell.tsx), so the
// public header and footer are not rendered on /admin. usePathname is available
// during SSR, so there is no flash of the public chrome.
import { usePathname } from "next/navigation";

export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname?.startsWith("/admin/")) return null;
  return <>{children}</>;
}
