import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";
import { auditEntry } from "@/lib/audit";

type RouteContext = { params: Promise<{ id: string }> };

// Sign another user out everywhere (cut off a lost device or a departed staff
// member). Not available on yourself: use sign-out for that, so an admin cannot
// end their own session by mis-clicking a row.
export const DELETE = withApiErrorHandling(
  withRole<[RouteContext]>(["ADMIN"], async (req, actor, { params: paramsPromise }) => {
    const { id } = await paramsPromise;
    if (id === actor.id) {
      return NextResponse.json({ error: "Use sign out for your own session" }, { status: 400 });
    }
    const target = await db.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [revoked] = await db.$transaction([
      db.session.deleteMany({ where: { userId: id } }),
      auditEntry(req, actor, {
        action: "user.sessions_revoked",
        entityType: "User",
        entityId: id,
        summary: `Signed ${target.email} out everywhere`,
      }),
    ]);
    return NextResponse.json({ ok: true, revoked: revoked.count });
  })
);
