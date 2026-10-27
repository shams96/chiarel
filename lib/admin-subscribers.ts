// Shaping of newsletter subscriber rows for the admin console. A Viewer sees
// that people are subscribed, not who: masked email, no consent detail.
import type { Role } from "@prisma/client";
import { maskEmail } from "@/lib/admin-orders";

export type SubscriberRow = {
  id: string;
  email: string;
  source: string;
  consentAt: Date;
  consentTextVersion: string;
  createdAt: Date;
  unsubscribedAt: Date | null;
};

export function presentSubscriber(s: SubscriberRow, role: Role) {
  const status = s.unsubscribedAt ? "unsubscribed" : "active";
  if (role === "VIEWER") {
    return {
      id: s.id,
      email: maskEmail(s.email),
      source: s.source,
      status,
      createdAt: s.createdAt,
      unsubscribedAt: s.unsubscribedAt,
      redacted: true,
    };
  }
  return {
    id: s.id,
    email: s.email,
    source: s.source,
    status,
    consentAt: s.consentAt,
    consentTextVersion: s.consentTextVersion,
    createdAt: s.createdAt,
    unsubscribedAt: s.unsubscribedAt,
    redacted: false,
  };
}
