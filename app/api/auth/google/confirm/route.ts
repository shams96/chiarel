import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recordAuthEvent } from "@/lib/audit";
import { withApiErrorHandling } from "@/lib/api-error";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { AUDIT, PROVIDER, googleConfig, readLinkToken } from "@/lib/oauth-google";
import { loginRedirect, notFound, unavailableIfJson503 } from "@/lib/social-login-http";

const WINDOW_MS = 10 * 60 * 1000;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// GET only shows a button. Linking happens on POST, so an email scanner or link
// preview that fetches the URL cannot link anything by itself.
export async function GET(req: NextRequest) {
  const cfg = googleConfig();
  if (!cfg) return notFound();
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!readLinkToken(cfg, token)) return loginRedirect("link_invalid", false);
  const html =
    '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Confirm Google sign-in</title>' +
    '<form method="post" style="font-family:sans-serif;max-width:32rem;margin:4rem auto">' +
    "<p>Allow this Google account to sign in to the CHIAREL admin console?</p>" +
    `<input type="hidden" name="token" value="${esc(token)}">` +
    '<button type="submit" style="padding:.7rem 1.2rem">Confirm and link</button></form>';
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

const post = withApiErrorHandling(
  async (req: NextRequest) => {
    const cfg = googleConfig();
    if (!cfg) return notFound();
    if (isRateLimited(`google-confirm:${clientIp(req)}`, 10, WINDOW_MS)) return loginRedirect("rate_limited", false);

    const form = await req.formData().catch(() => null);
    const raw = form?.get("token");
    const token = readLinkToken(cfg, typeof raw === "string" ? raw : undefined);
    if (!token) return loginRedirect("link_invalid", false);

    const user = await db.user.findUnique({ where: { id: token.uid } });
    // The address must still belong to the same user: an email change after the
    // link was sent invalidates it.
    if (!user || user.email !== token.email) return loginRedirect("link_invalid", false);

    const existing = await db.identity.findUnique({
      where: { provider_subject: { provider: PROVIDER, subject: token.sub } },
    });
    if (existing) {
      // Re-clicking the same link is harmless; a subject already tied to someone else is refused.
      return loginRedirect(existing.userId === user.id ? "linked" : "link_invalid", false);
    }

    await db.identity.create({
      data: { provider: PROVIDER, subject: token.sub, email: token.email, userId: user.id },
    });
    await recordAuthEvent(req, { id: user.id, email: user.email }, {
      action: AUDIT.link,
      entityType: "User",
      entityId: user.id,
      summary: "Linked Google sign-in",
    });
    return loginRedirect("linked", false);
  },
  { noRetry: true }
);

export async function POST(req: NextRequest) {
  return unavailableIfJson503(await post(req));
}
