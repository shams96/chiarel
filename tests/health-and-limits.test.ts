import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const queryRaw = vi.fn();
vi.mock("@/lib/db", () => ({ db: { $queryRaw: (...a: unknown[]) => queryRaw(...a) } }));

const { GET } = await import("@/app/api/health/route");
const { isRateLimited } = await import("@/lib/rate-limit");

const req = (qs = "", ip = "9.9.9.9") =>
  new NextRequest(`http://localhost/api/health${qs}`, { headers: { "x-forwarded-for": ip } });

describe("/api/health", () => {
  it("answers without touching the database", async () => {
    const res = await GET(req());
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("?db=1 reports the database timing, and 503 when the database fails", async () => {
    queryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);
    const ok = await (await GET(req("?db=1", "1.1.1.1"))).json();
    expect(ok.db.ok).toBe(true);
    queryRaw.mockRejectedValueOnce(new Error("down"));
    const bad = await GET(req("?db=1", "2.2.2.2"));
    expect(bad.status).toBe(503);
  });

  it("?db=1 is throttled per IP so it cannot be used to exhaust the pool", async () => {
    queryRaw.mockResolvedValue([{}]);
    const statuses: number[] = [];
    for (let i = 0; i < 12; i++) statuses.push((await GET(req("?db=1", "3.3.3.3"))).status);
    expect(statuses.slice(0, 10).every((s) => s === 200)).toBe(true);
    expect(statuses.slice(10)).toEqual([429, 429]);
  });
});

describe("rate limiter memory", () => {
  it("drops expired windows once the map is large, so it cannot grow forever", () => {
    vi.useFakeTimers();
    try {
      for (let i = 0; i < 5100; i++) isRateLimited(`ip-${i}`, 5, 1000);
      vi.advanceTimersByTime(2000);
      // Triggers the sweep; the old keys are expired, so a fresh hit starts a new window.
      expect(isRateLimited("ip-0", 1, 1000)).toBe(false);
      expect(isRateLimited("ip-0", 1, 1000)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
