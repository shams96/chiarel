import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

// Internal surface: never indexed, never followed. Access is enforced by the
// API routes (withRole), not by this page shell.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
