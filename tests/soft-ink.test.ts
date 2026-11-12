import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
function walk(dir: string, out: string[] = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}
const files = [...walk(path.join(root, "app")), ...walk(path.join(root, "components"))].filter(
  (f) => !/components[\\/]Footer\.tsx$/.test(f),
);

describe("soft ink", () => {
  it("ink token is the Apple-measured near-black", () => {
    // The token is a theme variable; its Day value is the near-black #1D1D1F (29 29 31).
    expect(fs.readFileSync(path.join(root, "tailwind.config.ts"), "utf8")).toContain('ink: "rgb(var(--c-ink) / <alpha-value>)"');
    expect(fs.readFileSync(path.join(root, "app/globals.css"), "utf8")).toMatch(/:root,\s*\[data-theme="light"\][\s\S]*?--c-ink: 29 29 31;/);
  });
  it("no hard-coded pure black or the old near-black", () => {
    const bad = /text-black|bg-black|border-black|#000\b(?!0)|#000000|#111\b|#111111|#1C1A17|28[ ,]+26[ ,]+23/i;
    const hits: string[] = [];
    for (const f of files) {
      fs.readFileSync(f, "utf8").split(/\r?\n/).forEach((l, i) => {
        if (bad.test(l) && !/mask|ELLIPSE/.test(l)) hits.push(`${path.relative(root, f)}:${i + 1}`);
      });
    }
    expect(hits).toEqual([]);
  });
  it("text opacity ladder stays AA-safe (only /70 and /80 on ink text)", () => {
    const hits: string[] = [];
    for (const f of files) {
      const s = fs.readFileSync(f, "utf8");
      for (const m of s.matchAll(/(?<![\w-])(?:placeholder:)?text-ink\/(\d+)/g)) {
        if (![70, 80].includes(+m[1])) hits.push(`${path.relative(root, f)}: ${m[0]}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
