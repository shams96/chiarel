import { NextRequest, NextResponse } from "next/server";
import { getSessionIdFromRequest, destroySessionById, clearSessionCookie } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const sessionId = getSessionIdFromRequest(req);
  if (sessionId) {
    await destroySessionById(sessionId);
  }
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
});
