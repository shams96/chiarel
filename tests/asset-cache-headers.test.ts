import { describe, expect, it } from "vitest";
import nextConfig from "../next.config.mjs";

type Rule = { source: string; headers: { key: string; value: string }[] };

// Images are swapped in place under the same filename, so /assets must never be
// served with a long-lived cache header (see scripts/publish-images.mjs).
describe("asset cache headers", () => {
  it("makes /assets revalidate on every request", async () => {
    const rules = (await nextConfig.headers?.()) as Rule[] | undefined;
    const rule = rules?.find((r) => r.source === "/assets/:path*");
    const value = rule?.headers.find((h) => h.key === "Cache-Control")?.value ?? "";
    expect(value).toContain("max-age=0");
    expect(value).toContain("must-revalidate");
    expect(value).not.toMatch(/immutable|max-age=[1-9]/);
  });
});
