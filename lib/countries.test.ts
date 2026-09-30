import { describe, it, expect } from "vitest";
import { COUNTRIES, ENABLED_COUNTRIES, getCountry } from "./countries";

// This is exactly the branching a QA pass caught a real bug in: getCountry()
// used to return a country regardless of its `enabled` flag, so a direct API
// call with country=IT could bypass the Italy feature flag entirely (see
// claudedocs/specs/international-launch/TASKS.md). The fix moved the enabled
// check to the API route's call site, not into getCountry() itself — these
// tests pin both halves of that contract so neither regresses silently.

describe("getCountry", () => {
  it("returns a country config for a known code, enabled or not", () => {
    expect(getCountry("US")?.code).toBe("US");
    expect(getCountry("IT")?.code).toBe("IT");
  });

  it("returns undefined for an unknown code", () => {
    expect(getCountry("ZZ")).toBeUndefined();
    expect(getCountry("")).toBeUndefined();
  });

  it("does NOT filter by enabled — callers must check .enabled themselves", () => {
    // Pins the current contract explicitly: getCountry() is a lookup, not an
    // authorization check. app/api/checkout/route.ts is responsible for
    // rejecting a disabled country; this test exists so that responsibility
    // is never silently dropped if getCountry() is refactored later.
    const italy = getCountry("IT");
    expect(italy).toBeDefined();
    expect(italy?.enabled).toBe(false);
  });
});

describe("ENABLED_COUNTRIES", () => {
  it("excludes Italy while its feature flag is off", () => {
    expect(ENABLED_COUNTRIES.map((c) => c.code)).not.toContain("IT");
  });

  it("includes exactly US, Canada, and UAE for v1", () => {
    expect(ENABLED_COUNTRIES.map((c) => c.code).sort()).toEqual(["AE", "CA", "US"]);
  });
});

describe("requiresState", () => {
  it("is true for US and Canada, false for Italy and UAE", () => {
    expect(COUNTRIES.US.requiresState).toBe(true);
    expect(COUNTRIES.CA.requiresState).toBe(true);
    expect(COUNTRIES.IT.requiresState).toBe(false);
    expect(COUNTRIES.AE.requiresState).toBe(false);
  });
});

describe("postalLabel", () => {
  it("is distinct per country, never silently defaulting to ZIP for non-US", () => {
    expect(COUNTRIES.US.postalLabel).toBe("ZIP");
    expect(COUNTRIES.CA.postalLabel).not.toBe("ZIP");
    expect(COUNTRIES.IT.postalLabel).not.toBe("ZIP");
    expect(COUNTRIES.AE.postalLabel).not.toBe("ZIP");
  });
});
