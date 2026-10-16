import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const src = readFileSync("app/checkout/page.tsx", "utf8");

// Every shipping field has a visible label bound to it and an autofill hint, so
// phones can fill the form and screen readers announce each field.
describe("checkout form labels and autofill", () => {
  const fields = [...src.matchAll(/<Field label=\{?"?([^"}]+)"?\}? id="([^"]+)">([\s\S]*?)<\/Field>/g)];

  it("has a labelled field for each shipping input", () => {
    expect(fields.map((f) => f[2])).toEqual([
      "co-email", "co-first", "co-last", "co-country", "co-address", "co-city", "co-state", "co-zip",
    ]);
  });

  it("binds each label to a control with the same id and an autocomplete token", () => {
    for (const [, , id, body] of fields) {
      expect(body, id).toContain(`id="${id}"`);
      expect(body, id).toMatch(/autoComplete="/);
    }
  });

  it("no input relies on a placeholder as its only label", () => {
    expect(src).not.toMatch(/placeholder="(City|State|Address)"/);
  });
});
