import { NextResponse } from "next/server";

// Neutral age screen for signup forms (COPPA). The form asks for a date of
// birth with no hint about the cut-off, no pre-filled value and no "I am over
// 13" tick box. Under-13 answers store nothing, and a cookie stops a retry
// with a different date. The date of birth itself is never stored.
export const MIN_AGE = 13;
export const AGE_BLOCK_COOKIE = "chiarel_age_block";
const BLOCK_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

// Same wording for an under-13 answer and for a blocked retry, and it does
// not say why.
export const AGE_BLOCK_MESSAGE = "We are unable to sign you up.";
export const AGE_INVALID_MESSAGE = "Please enter your date of birth.";

export type AgeCheck = "ok" | "blocked" | "invalid";

/** Strict YYYY-MM-DD (the value of <input type="date">). Returns UTC parts or null. */
export function parseDob(value: unknown): { y: number; m: number; d: number } | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return { y, m, d };
}

export function ageOn(dob: { y: number; m: number; d: number }, today: Date): number {
  let age = today.getUTCFullYear() - dob.y;
  const beforeBirthday =
    today.getUTCMonth() + 1 < dob.m || (today.getUTCMonth() + 1 === dob.m && today.getUTCDate() < dob.d);
  if (beforeBirthday) age -= 1;
  return age;
}

export function checkAge(value: unknown, now: Date = new Date()): AgeCheck {
  const dob = parseDob(value);
  if (!dob || dob.y < 1900) return "invalid";
  const age = ageOn(dob, now);
  if (age < 0) return "invalid"; // a date in the future
  return age < MIN_AGE ? "blocked" : "ok";
}

function blockedResponse(setCookie: boolean) {
  const res = NextResponse.json({ error: AGE_BLOCK_MESSAGE }, { status: 403 });
  if (setCookie) {
    res.cookies.set(AGE_BLOCK_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: BLOCK_MAX_AGE_SECONDS,
      path: "/",
    });
  }
  return res;
}

/**
 * Run before anything is stored. Returns a response to send back when the
 * signup must stop, or null when the visitor may continue.
 */
export function ageGate(req: { cookies: { get(name: string): unknown } }, dateOfBirth: unknown): NextResponse | null {
  if (req.cookies.get(AGE_BLOCK_COOKIE)) return blockedResponse(false);
  const result = checkAge(dateOfBirth);
  if (result === "invalid") return NextResponse.json({ error: AGE_INVALID_MESSAGE }, { status: 400 });
  if (result === "blocked") return blockedResponse(true);
  return null;
}
