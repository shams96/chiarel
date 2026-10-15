import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeEmail, verifyUnsubscribeToken } from "@/lib/subscribers";

// Signed link from the welcome email. GET so it works as a plain link; the
// action is idempotent and only ever suppresses mail.
export async function GET(req: NextRequest) {
  const done = (status: "ok" | "invalid") =>
    NextResponse.redirect(new URL(`/unsubscribed?status=${status}`, req.url), 303);

  const email = normalizeEmail(req.nextUrl.searchParams.get("e"));
  const token = req.nextUrl.searchParams.get("t") ?? "";
  if (!email || !verifyUnsubscribeToken(email, token)) return done("invalid");

  try {
    await db.emailSubscriber.updateMany({
      where: { email, unsubscribedAt: null },
      data: { unsubscribedAt: new Date() },
    });
  } catch (err) {
    console.error("[unsubscribe]", err);
    return done("invalid");
  }
  return done("ok");
}
