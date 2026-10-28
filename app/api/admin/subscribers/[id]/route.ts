import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";
import { auditEntry } from "@/lib/audit";
import { maskEmail } from "@/lib/admin-orders";
import { presentSubscriber } from "@/lib/admin-subscribers";

type RouteContext = { params: Promise<{ id: string }> };

class AlreadyUnsubscribed extends Error {}

// Remove someone from the newsletter (they asked by email, or a complaint).
// Admin and Member. There is deliberately NO resubscribe action: consent has to
// come from the person, never from an operator. Unsubscribing is idempotent: a
// repeat leaves the original unsubscribedAt untouched and writes no audit entry.
export const PATCH = withApiErrorHandling(
  withRole<[RouteContext]>(["ADMIN", "MEMBER"], async (req, user, { params }) => {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (body?.action !== "unsubscribe") {
      return NextResponse.json({ error: 'action must be "unsubscribe"' }, { status: 400 });
    }

    const sub = await db.emailSubscriber.findUnique({ where: { id } });
    if (!sub) return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    if (sub.unsubscribedAt) {
      return NextResponse.json({ subscriber: presentSubscriber(sub, user.role), unchanged: true });
    }

    const now = new Date();
    try {
      await db.$transaction(async (tx) => {
        const res = await tx.emailSubscriber.updateMany({
          where: { id, unsubscribedAt: null },
          data: { unsubscribedAt: now },
        });
        // Someone else unsubscribed them between our read and write.
        if (res.count !== 1) throw new AlreadyUnsubscribed();
        await auditEntry(
          req,
          user,
          {
            action: "subscriber.unsubscribe",
            entityType: "EmailSubscriber",
            entityId: id,
            summary: `Unsubscribed ${maskEmail(sub.email)} (${sub.source})`,
            before: { unsubscribedAt: null },
            after: { unsubscribedAt: now.toISOString() },
          },
          tx
        );
      });
    } catch (err) {
      if (!(err instanceof AlreadyUnsubscribed)) throw err;
    }

    const fresh = await db.emailSubscriber.findUnique({ where: { id } });
    return NextResponse.json({ subscriber: fresh ? presentSubscriber(fresh, user.role) : null });
  })
);
