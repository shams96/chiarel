import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, email, phone, social, referredBy, source } = await req.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const webhookUrl = process.env.FOUNDING_LIST_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("FOUNDING_LIST_WEBHOOK_URL is not configured");
    return NextResponse.json(
      { error: "Signup is not configured yet" },
      { status: 503 }
    );
  }

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
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Founding list webhook failed:", err);
    return NextResponse.json({ error: "Could not save signup" }, { status: 502 });
  }
}
