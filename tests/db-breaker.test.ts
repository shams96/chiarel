import { describe, expect, it } from "vitest";
import { createBreaker } from "@/lib/db-breaker";
import { capEngineThreads } from "@/lib/db-engine-limits";

function clock(start = 1_000_000) {
  let t = start;
  return { now: () => t, advance: (ms: number) => (t += ms) };
}

describe("createBreaker", () => {
  it("stays closed below the threshold and opens at it", () => {
    const c = clock();
    const b = createBreaker({ threshold: 3, now: c.now });
    b.failure();
    b.failure();
    expect(b.state()).toBe("closed");
    expect(b.tryAcquire()).toBe(true);
    b.failure();
    expect(b.state()).toBe("open");
    expect(b.tryAcquire()).toBe(false);
  });

  it("forgets failures that are older than the window", () => {
    const c = clock();
    const b = createBreaker({ threshold: 3, windowMs: 30_000, now: c.now });
    b.failure();
    b.failure();
    c.advance(31_000);
    b.failure();
    expect(b.state()).toBe("closed");
  });

  it("a success clears the count", () => {
    const b = createBreaker({ threshold: 2, now: clock().now });
    b.failure();
    b.success();
    b.failure();
    expect(b.state()).toBe("closed");
  });

  it("lets exactly one probe through after the cooldown", () => {
    const c = clock();
    const b = createBreaker({ threshold: 1, cooldownMs: 15_000, now: c.now });
    b.failure();
    c.advance(14_999);
    expect(b.tryAcquire()).toBe(false);
    c.advance(1);
    expect(b.state()).toBe("half-open");
    expect(b.tryAcquire()).toBe(true);
    expect(b.tryAcquire()).toBe(false); // a probe is already in flight
  });

  it("closes when the probe succeeds and re-opens for a full cooldown when it fails", () => {
    const c = clock();
    const b = createBreaker({ threshold: 1, cooldownMs: 10_000, now: c.now });
    b.failure();
    c.advance(10_000);
    expect(b.tryAcquire()).toBe(true);
    b.failure();
    expect(b.state()).toBe("open");
    expect(b.retryAfterSeconds()).toBe(10);
    c.advance(10_000);
    expect(b.tryAcquire()).toBe(true);
    b.success();
    expect(b.state()).toBe("closed");
    expect(b.tryAcquire()).toBe(true);
  });

  it("reports how long until the next probe, never less than a second", () => {
    const c = clock();
    const b = createBreaker({ threshold: 1, cooldownMs: 15_000, now: c.now });
    expect(b.retryAfterSeconds()).toBe(0);
    b.failure();
    expect(b.retryAfterSeconds()).toBe(15);
    c.advance(14_900);
    expect(b.retryAfterSeconds()).toBe(1);
  });
});

describe("capEngineThreads", () => {
  it("sets a small default and never overrides an operator value", () => {
    const empty: { TOKIO_WORKER_THREADS?: string } = {};
    expect(capEngineThreads(empty)).toBe("2");
    expect(empty.TOKIO_WORKER_THREADS).toBe("2");
    const set = { TOKIO_WORKER_THREADS: "4" };
    expect(capEngineThreads(set)).toBe("4");
  });
});
