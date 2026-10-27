import type { NextRequest } from "next/server";
import type { Prisma, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { clientIp } from "@/lib/rate-limit";

// Append-only audit trail for the admin console (claudedocs/specs/admin-console/).
// Two ways to write an entry:
//  - auditEntry(): a data-changing route passes its transaction client so the
//    entry is written in the same db.$transaction as the change, which means a
//    change can never commit without its entry (and vice versa).
//  - recordAuthEvent(): best-effort, for sign-in/out style events, where an audit
//    outage must not lock the owner out.
// before/after must only ever carry values from the snapshot helpers below.

export type Actor = { id: string | null; email: string };

export type AuditInput = {
  action: string;
  entityType: string;
  entityId?: string | null;
  summary?: string;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
};

// The one place that decides which user fields may reach the log. It picks
// fields instead of omitting them, so a column added to User later (a hash, a
// token) stays out of the log unless someone adds it here on purpose.
export function userSnapshot(u: { id: string; email: string; role: Role }) {
  return { id: u.id, email: u.email, role: u.role };
}

export function auditEntry(
  req: NextRequest,
  actor: Actor,
  input: AuditInput,
  client: Pick<Prisma.TransactionClient, "auditLog"> = db
) {
  return client.auditLog.create({
    data: {
      actorId: actor.id,
      actorEmail: actor.email,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      summary: input.summary,
      before: input.before,
      after: input.after,
      ip: clientIp(req),
    },
  });
}

export async function recordAuthEvent(req: NextRequest, actor: Actor, input: AuditInput) {
  try {
    await auditEntry(req, actor, input);
  } catch (err) {
    console.error("[audit] failed to record auth event", input.action, err);
  }
}
