import { describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { isRetryableDbError, retryDb, withConnectionDefaults } from "@/lib/db-resilience";
import { withApiErrorHandling } from "@/lib/api-error";

describe("withConnectionDefaults", () => {
  it("adds timeouts and a pool size when the URL has none, keeping existing params", () => {
    const out = new URL(withConnectionDefaults("postgresql://u:p@host:6543/db?pgbouncer=true")!);
    expect(out.searchParams.get("pgbouncer")).toBe("true");
    expect(out.searchParams.get("connect_timeout")).toBe("10");
    expect(out.searchParams.get("pool_timeout")).toBe("10");
    expect(out.searchParams.get("connection_limit")).toBe("5");
    expect(out.searchParams.get("socket_timeout")).toBe("15");
    expect(out.searchParams.get("max_idle_connection_lifetime")).toBe("20");
  });

  it("never overrides a value the operator already set", () => {
    const out = new URL(withConnectionDefaults("postgresql://u:p@host/db?connect_timeout=3&connection_limit=1")!);
    expect(out.searchParams.get("connect_timeout")).toBe("3");
    expect(out.searchParams.get("connection_limit")).toBe("1");
  });

  it("passes through a missing or unparseable value", () => {
    expect(withConnectionDefaults(undefined)).toBeUndefined();
    expect(withConnectionDefaults("not a url")).toBe("not a url");
  });
});

describe("isRetryableDbError", () => {
  it("retries errors raised before any SQL was sent, for reads and writes", () => {
    for (const code of ["P1001", "P2024"]) {
      expect(isRetryableDbError({ code }, true)).toBe(true);
      expect(isRetryableDbError({ code }, false)).toBe(true);
    }
  });

  it("retries ambiguous errors only for reads, so a write is never repeated", () => {
    for (const code of ["P1002", "P1008", "P1017"]) {
      expect(isRetryableDbError({ code }, true)).toBe(true);
      expect(isRetryableDbError({ code }, false)).toBe(false);
    }
  });

  it("does not retry other errors", () => {
    expect(isRetryableDbError({ code: "P2002" }, true)).toBe(false);
    expect(isRetryableDbError(new Error("boom"), true)).toBe(false);
    expect(isRetryableDbError(null, true)).toBe(false);
  });
});

describe("retryDb", () => {
  it("succeeds after a transient failure", async () => {
    const fn = vi.fn().mockRejectedValueOnce({ code: "P1001" }).mockResolvedValue("ok");
    await expect(retryDb(fn, { readOnly: false, baseDelayMs: 1 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("gives up after the retry budget and rethrows", async () => {
    const fn = vi.fn().mockRejectedValue({ code: "P1001" });
    await expect(retryDb(fn, { readOnly: true, retries: 2, baseDelayMs: 1 })).rejects.toEqual({ code: "P1001" });
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("does not retry a write on an ambiguous error", async () => {
    const fn = vi.fn().mockRejectedValue({ code: "P1017" });
    await expect(retryDb(fn, { readOnly: false, baseDelayMs: 1 })).rejects.toEqual({ code: "P1017" });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("withApiErrorHandling", () => {
  const silence = () => vi.spyOn(console, "error").mockImplementation(() => {});

  it("returns 503 JSON when the handler keeps failing", async () => {
    silence();
    const handler = withApiErrorHandling(async () => {
      throw new Error("db down");
    });
    const res = await handler();
    expect(res.status).toBe(503);
  });

  it("a GET retries a transient error once and then succeeds", async () => {
    const inner = vi.fn().mockRejectedValueOnce({ code: "P1017" }).mockResolvedValue(NextResponse.json({ ok: 1 }));
    const res = await withApiErrorHandling(inner)(new Request("http://x/api", { method: "GET" }));
    expect(res.status).toBe(200);
    expect(inner).toHaveBeenCalledTimes(2);
  });

  it("a GET that keeps failing gives up after one retry with a 503", async () => {
    silence();
    const inner = vi.fn().mockRejectedValue({ code: "P1001" });
    const res = await withApiErrorHandling(inner)(new Request("http://x/api", { method: "GET" }));
    expect(res.status).toBe(503);
    expect(inner).toHaveBeenCalledTimes(2);
  });

  it("a POST is never retried, even for an error raised before any SQL was sent", async () => {
    silence();
    for (const code of ["P1001", "P2024", "P1017"]) {
      const inner = vi.fn(async (req: Request) => {
        await req.json(); // consumes the body, as the checkout and cart handlers do
        throw { code };
      });
      const req = new Request("http://x/api", { method: "POST", body: JSON.stringify({ a: 1 }) });
      const res = await withApiErrorHandling(inner)(req);
      expect(res.status).toBe(503); // a real 503, not a misleading 400 from a re-read body
      expect(inner).toHaveBeenCalledTimes(1);
    }
  });
});
