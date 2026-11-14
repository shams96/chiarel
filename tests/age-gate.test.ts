import { describe, it, expect } from "vitest";
import { checkAge, parseDob, ageOn } from "@/lib/age-gate";

const NOW = new Date(Date.UTC(2026, 10, 14)); // 2026-11-14

describe("checkAge", () => {
  it("blocks anyone under 13 and allows 13 on the birthday", () => {
    expect(checkAge("2013-11-15", NOW)).toBe("blocked"); // turns 13 tomorrow
    expect(checkAge("2013-11-14", NOW)).toBe("ok"); // turns 13 today
    expect(checkAge("2020-01-01", NOW)).toBe("blocked");
    expect(checkAge("1990-05-20", NOW)).toBe("ok");
  });
  it("treats junk, impossible and future dates as invalid", () => {
    for (const v of [undefined, null, 123, "", "05/20/1990", "1990-13-01", "1990-02-30", "1850-01-01", "2027-01-01"]) {
      expect(checkAge(v, NOW)).toBe("invalid");
    }
  });
  it("computes age across leap days", () => {
    expect(ageOn(parseDob("2012-02-29")!, new Date(Date.UTC(2025, 1, 28)))).toBe(12);
    expect(ageOn(parseDob("2012-02-29")!, new Date(Date.UTC(2025, 2, 1)))).toBe(13);
  });
});
