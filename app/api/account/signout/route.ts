import { NextRequest, NextResponse } from "next/server";
import { withApiErrorHandling } from "@/lib/api-error";
import { recordAuthEvent } from "@/lib/audit";
import { CUSTOMER_AUDIT } from "@/lib/customer-auth";
import { clearCustomerCookie, destroyCustomerSession, getCustomerSession } from "@/lib/customer-session";

const handler = withApiErrorHandling(async (req: NextRequest) => {
  const auth = await getCustomerSession(req);
  if (auth) {
    await destroyCustomerSession(auth.sessionId);
    await recordAuthEvent(req, { id: null, email: auth.customer.email }, {
      action: CUSTOMER_AUDIT.signOut,
      entityType: "Customer",
      entityId: auth.customer.id,
      summary: "Customer signed out",
    });
  }
  const res = NextResponse.json({ ok: true });
  clearCustomerCookie(res);
  return res;
});

export async function POST(req: NextRequest) {
  const res = await handler(req);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
