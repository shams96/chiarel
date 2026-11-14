import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CodeLogin from "@/components/account/CodeLogin";
import { googleSignInEnabled } from "@/lib/oauth-google";
import { CUSTOMER_COOKIE, resolveCustomerSession } from "@/lib/customer-session";
import { safeReturnTo } from "@/lib/return-to";

export const metadata = { title: "Sign in", robots: { index: false, follow: false } };
// Whether the Google button shows depends on env vars set on the host.
export const dynamic = "force-dynamic";

export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string | string[]; notice?: string | string[] }>;
}) {
  const sp = await searchParams;
  const returnTo = safeReturnTo(typeof sp.return_to === "string" ? sp.return_to : undefined);

  // Already signed in: go where they were headed. A database outage must not
  // stop the form from rendering, so a failed lookup just shows the form.
  const signedIn = await resolveCustomerSession((await cookies()).get(CUSTOMER_COOKIE)?.value).catch(() => null);
  if (signedIn) redirect(returnTo);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-serif text-4xl">Your Ritual</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink">
        Enter your email and we will send you a code. No password needed.
      </p>
      <div className="mt-8">
        <CodeLogin
          googleEnabled={googleSignInEnabled()}
          returnTo={returnTo}
          notice={typeof sp.notice === "string" ? sp.notice : undefined}
        />
      </div>
      <p className="mt-10 text-[13px] leading-relaxed text-ink">
        You never need an account to order.{" "}
        <Link href="/shop" className="text-ink underline underline-offset-4">
          Continue as a guest
        </Link>
      </p>
    </div>
  );
}
