import { describe, it, expect, afterEach } from "vitest";
import EmailSignup from "@/components/EmailSignup";

const original = process.env.NEXT_PUBLIC_EMAIL_SIGNUP;
afterEach(() => {
  if (original === undefined) delete process.env.NEXT_PUBLIC_EMAIL_SIGNUP;
  else process.env.NEXT_PUBLIC_EMAIL_SIGNUP = original;
});

describe("EmailSignup visibility flag", () => {
  it("renders nothing until NEXT_PUBLIC_EMAIL_SIGNUP=on", () => {
    delete process.env.NEXT_PUBLIC_EMAIL_SIGNUP;
    expect(EmailSignup({ source: "home" })).toBeNull();
    process.env.NEXT_PUBLIC_EMAIL_SIGNUP = "off";
    expect(EmailSignup({ source: "home" })).toBeNull();
  });

  it("renders the form when the flag is on", () => {
    process.env.NEXT_PUBLIC_EMAIL_SIGNUP = "on";
    expect(EmailSignup({ source: "home" })).not.toBeNull();
  });
});
