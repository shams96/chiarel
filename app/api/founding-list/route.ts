import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const FOUNDING_CAP = 100;

export async function GET() {
  const claimed = await db.foundingSignup.count();
  return NextResponse.json({ claimed, cap: FOUNDING_CAP });
}

export async function POST(req: NextRequest) {
  const { name, email, phone, social, referredBy, source } = await req.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // The local row is the source of truth for the live "N of 100" counter on
  // the page — save it first so the count is accurate even if the CRM
  // webhook below is slow, misconfigured, or down.
  await db.foundingSignup.create({
    data: {
      name,
      email,
      phone: phone || null,
      social: social || null,
      referredBy: referredBy || null,
      source: source ?? "Unknown",
    },
  });

  const webhookUrl = process.env.FOUNDING_LIST_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || "",
          social: social || "",
          referredBy: referredBy || "",
          source: source ?? "Unknown",
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    } catch (err) {
      // The signup is already saved locally and will show up in the live
      // count regardless — a CRM sync failure shouldn't fail the signup
      // itself or tell the customer to try again.
      console.error("Founding list webhook failed:", err);
    }
  } else {
    console.error("FOUNDING_LIST_WEBHOOK_URL is not configured — signup saved locally only");
  }

  return NextResponse.json({ ok: true });
}
