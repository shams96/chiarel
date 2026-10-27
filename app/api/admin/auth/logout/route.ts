import { NextRequest, NextResponse } from "next/server";
import {
  getSessionIdFromRequest,
  getSessionUser,
  destroySessionById,
  clearSessionCookie,
} from "@/lib/auth";
import { recordAuthEvent } from "@/lib/audit";
import { withApiErrorHandling } from "@/lib/api-error";

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const sessionId = getSessionIdFromRequest(req);
  if (sessionId) {
    const user = await getSessionUser(req);
    if (user) {
      await recordAuthEvent(
        req,
        { id: user.id, email: user.email },
        { action: "auth.logout", entityType: "User", entityId: user.id }
      );
    }
    await destroySessionById(sessionId);
  }
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
});
