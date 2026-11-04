import { describe, it, expect, afterEach } from "vitest";
import { accountsSmtpPass } from "@/lib/mail";

describe("accountsSmtpPass", () => {
  const saved = { a: process.env.ACCOUNTS_SMTP_PASS, b: process.env.ACCOUNTS_SMTP_PASSWORD };
  afterEach(() => {
    for (const [k, v] of [["ACCOUNTS_SMTP_PASS", saved.a], ["ACCOUNTS_SMTP_PASSWORD", saved.b]] as const) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  it("accepts either variable name, PASS first", () => {
    delete process.env.ACCOUNTS_SMTP_PASS;
    delete process.env.ACCOUNTS_SMTP_PASSWORD;
    expect(accountsSmtpPass()).toBeUndefined();
    process.env.ACCOUNTS_SMTP_PASSWORD = "from-password";
    expect(accountsSmtpPass()).toBe("from-password");
    process.env.ACCOUNTS_SMTP_PASS = "from-pass";
    expect(accountsSmtpPass()).toBe("from-pass");
  });
});
