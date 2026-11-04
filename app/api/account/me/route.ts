import { NextRequest, NextResponse } from "next/server";
import { withApiErrorHandling } from "@/lib/api-error";
import { CUSTOMER_COOKIE, getCustomerSession, setCustomerCookie } from "@/lib/customer-session";

const handler = withApiErrorHandling(async (req: NextRequest) => {
  const auth = await getCustomerSession(req);
  if (!auth) return NextResponse.json({ signedIn: false }, { status: 401 });
  const res = NextResponse.json({ signedIn: true, customer: { email: auth.customer.email, name: auth.customer.name } });
  // The session slid forward in the database: slide the cookie's own lifetime too.
  if (auth.refreshed) setCustomerCookie(res, req.cookies.get(CUSTOMER_COOKIE)!.value);
  return res;
});

export async function GET(req: NextRequest) {
  const res = await handler(req);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
