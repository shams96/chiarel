import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

const req = (xff?: string) => new NextRequest("http://localhost/x", { headers: xff ? { "x-forwarded-for": xff } : {} });

describe("clientIp", () => {
  it("uses the rightmost entry, so a spoofed leading entry does not change the key", () => {
    expect(clientIp(req("203.0.113.9"))).toBe("203.0.113.9");
    expect(clientIp(req("1.2.3.4, 203.0.113.9"))).toBe("203.0.113.9");
    expect(clientIp(req("9.9.9.9, 8.8.8.8, 203.0.113.9"))).toBe("203.0.113.9");
    expect(clientIp(req())).toBe("unknown");
  });

  it("rotating the forged prefix cannot dodge a limit keyed on the IP", () => {
    const key = (xff: string) => `spoof-test:${clientIp(req(xff))}`;
    const results = Array.from({ length: 14 }, (_, i) => isRateLimited(key(`10.0.0.${i}, 203.0.113.77`), 10, 60_000));
    expect(results.slice(0, 10).every((r) => r === false)).toBe(true);
    expect(results.slice(10).every((r) => r === true)).toBe(true);
  });

  it("stays bounded under a flood of distinct keys (oldest evicted, newest kept)", () => {
    const hour = 60 * 60 * 1000;
    for (let i = 0; i < 25_000; i++) isRateLimited(`flood:${i}`, 5, hour);
    // flood:0 was evicted, so it starts a fresh window and needs 6 hits to trip.
    for (let n = 0; n < 5; n++) expect(isRateLimited("flood:0", 5, hour)).toBe(false);
    expect(isRateLimited("flood:0", 5, hour)).toBe(true);
    // The newest key survived with its count (1 from the flood + 5 here > 5).
    for (let n = 0; n < 4; n++) isRateLimited("flood:24999", 5, hour);
    expect(isRateLimited("flood:24999", 5, hour)).toBe(true);
  });
});
