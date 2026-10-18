import { describe, expect, it } from "vitest";
// @ts-expect-error plain .mjs config
import nextConfig from "../next.config.mjs";

// Images are swapped in place under the same filename, so /assets must never be
// served with a long-lived cache header (see scripts/publish-images.mjs).
describe("asset cache headers", () => {
  it("makes /assets revalidate on every request", async () => {
    const rules = await nextConfig.headers();
    const rule = rules.find((r: { source: string }) => r.source === "/assets/:path*");
    expect(rule).toBeTruthy();
    const cc = rule.headers.find((h: { key: string }) => h.key === "Cache-Control");
    expect(cc.value).toContain("max-age=0");
    expect(cc.value).toContain("must-revalidate");
    expect(cc.value).not.toMatch(/immutable|max-age=[1-9]/);
  });
});
