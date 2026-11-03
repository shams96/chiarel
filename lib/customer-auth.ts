import type { NextRequest, NextResponse } from "next/server";
import type { Customer } from "@prisma/client";
import { db } from "@/lib/db";
import { recordAuthEvent } from "@/lib/audit";
import { sendMail } from "@/lib/mail";
import { createCustomerSession, setCustomerCookie } from "@/lib/customer-session";

// Shared pieces of customer sign-in (email code and Google intent=customer).

export const CUSTOMER_AUDIT = {
  signIn: "customer.sign_in",
  failed: "customer.sign_in_failed",
  signOut: "customer.sign_out",
  link: "customer.social_link",
} as const;

// Google identities of customers use their own provider label. The Identity table
// has one unique (provider, subject), so an admin who signs in on the customer
// page with the same Google account would otherwise collide with their admin link.
export const CUSTOMER_PROVIDER = "google_customer";

export async function findOrCreateCustomerByEmail(email: string): Promise<Customer> {
  const existing = await db.customer.findUnique({ where: { email } });
  if (existing) return existing;
  try {
    return await db.customer.create({ data: { email } });
  } catch (err) {
    // Two first sign-ins for one address at once: the other one won, use its row.
    if ((err as { code?: string } | null)?.code === "P2002") {
      const winner = await db.customer.findUnique({ where: { email } });
      if (winner) return winner;
    }
    throw err;
  }
}

/** Guest orders placed with this (verified) address become this customer's. Returns how many. */
export async function attachGuestOrders(customer: { id: string; email: string }): Promise<number> {
  const res = await db.order.updateMany({
    where: { customerId: null, email: { equals: customer.email, mode: "insensitive" } },
    data: { customerId: customer.id },
  });
  return res.count;
}

/**
 * Starts a session for a customer whose email has just been proven (a code, or
 * Google's email_verified). Sets the cookie on `res`.
 */
export async function completeCustomerSignIn(
  req: NextRequest,
  res: NextResponse,
  customer: Customer,
  method: "code" | "google"
): Promise<void> {
  const signed = await createCustomerSession(customer.id, req.headers.get("user-agent"));
  await db.customer.update({ where: { id: customer.id }, data: { lastSignInAt: new Date() } });
  await attachGuestOrders(customer);
  await recordAuthEvent(req, { id: null, email: customer.email }, {
    action: CUSTOMER_AUDIT.signIn,
    entityType: "Customer",
    entityId: customer.id,
    summary: method === "google" ? "Customer signed in with Google" : "Customer signed in with an emailed code",
  });
  setCustomerCookie(res, signed);
}

export function codeEmail(code: string): { subject: string; text: string } {
  return {
    subject: "Your CHIAREL sign-in code",
    text: `Your CHIAREL sign-in code is ${code}\n\nIt works for 10 minutes. If you did not ask for it, you can ignore this message.\n\nCHIAREL, The House of Clarity\n`,
  };
}

/**
 * Sends the code. A failure is logged (never with the code) and swallowed: the
 * caller's answer must not depend on whether mail went out. In development only,
 * the code is printed so the flow can be tested without SMTP.
 */
export async function sendLoginCodeEmail(email: string, code: string): Promise<boolean> {
  const { subject, text } = codeEmail(code);
  try {
    await Promise.race([
      sendMail({ to: email, subject, text, fromAccounts: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("mail_timeout")), 12_000)),
    ]);
    return true;
  } catch (err) {
    console.error("[customer-login] code email failed:", (err as Error)?.message ?? "unknown");
    if (process.env.NODE_ENV === "development") {
      console.warn(`[customer-login:dev] sign-in code for ${email}: ${code}`);
    }
    return false;
  }
}
