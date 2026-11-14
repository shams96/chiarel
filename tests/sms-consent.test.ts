import { describe, it, expect } from "vitest";
import { normalizeNanpPhone, SMS_CONSENT_TEXT } from "@/lib/sms-consent";

describe("normalizeNanpPhone", () => {
  it("normalizes common US formats to +1XXXXXXXXXX", () => {
    for (const v of ["(415) 555-2671", "415-555-2671", "+1 415 555 2671", "14155552671", "4155552671"]) {
      expect(normalizeNanpPhone(v)).toBe("+14155552671");
    }
  });
  it("rejects non-NANP, short and malformed numbers", () => {
    for (const v of ["", "123", "+39 06 1234 5678", "0155552671", "415-155-2671", undefined, 4155552671]) {
      expect(normalizeNanpPhone(v)).toBeNull();
    }
  });
});

describe("SMS_CONSENT_TEXT", () => {
  it("carries every required disclosure", () => {
    for (const must of ["recurring automated marketing text messages", "not a condition of any purchase", "Message and data rates may apply", "frequency varies", "STOP", "HELP"]) {
      expect(SMS_CONSENT_TEXT).toContain(must);
    }
  });
});
