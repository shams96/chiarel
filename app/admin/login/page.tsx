import { googleSignInEnabled } from "@/lib/oauth-google";
import AdminLoginForm from "./LoginForm";

// Read on every request: whether the Google button shows depends on env vars
// that are set on the host, not at build time.
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const { notice } = await searchParams;
  return <AdminLoginForm googleEnabled={googleSignInEnabled()} notice={typeof notice === "string" ? notice : undefined} />;
}
