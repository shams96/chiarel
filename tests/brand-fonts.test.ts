// Brand font lock. Libre Bodoni is the sole family site-wide (owner brief 2026-10-31,
// ruling D1). Type-scale and layout work may change sizes, colours and widths, never the
// family. If this fails, the brand font was changed: revert it, or get an explicit owner
// decision and update this test in the same PR.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(p, "utf8");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(name)) out.push(p.replace(/\\/g, "/"));
  }
  return out;
}

describe("brand font lock: Libre Bodoni only", () => {
  const layout = read("app/layout.tsx");

  it("the layout loads exactly one family, Libre Bodoni, from the self-hosted files", () => {
    expect(layout).toContain('import localFont from "next/font/local"');
    expect(layout).not.toMatch(/from "next\/font\/google"/);
    expect(layout.match(/localFont\(/g)).toHaveLength(1);
    expect(layout).toContain("libre-bodoni-latin.woff2");
    expect(layout).toContain("libre-bodoni-latin-ext.woff2");
    expect(layout).toContain('variable: "--font-serif"');
    // comments may mention Jost (it is explained there); code must not load it
    expect(layout.replace(/\/\/.*$/gm, "")).not.toMatch(/jost/i);
  });

  it("Tailwind resolves both font-serif and font-sans to that one variable", () => {
    const cfg = read("tailwind.config.ts");
    expect(cfg.match(/fontFamily:/g)).toHaveLength(1);
    expect(cfg).toMatch(/serif:\s*\["var\(--font-serif\)",\s*"serif"\]/);
    expect(cfg).toMatch(/sans:\s*\["var\(--font-serif\)",\s*"serif"\]/);
    const block = cfg.match(/fontFamily:\s*\{[^}]*\}/)![0];
    const keys = [...block.matchAll(/^\s*(\w+):/gm)].map((m) => m[1]).filter((k) => k !== "fontFamily");
    expect(keys.sort()).toEqual(["sans", "serif"]);
  });

  it("no stylesheet declares its own font-family", () => {
    expect(read("app/globals.css")).not.toMatch(/font-family\s*:/);
  });

  it("no component or page names another family (known fallbacks and admin ids excepted)", () => {
    const ALLOWED = new Set([
      "app/global-error.tsx", // last-resort error shell, renders outside the layout
      "lib/social-login-http.ts", // plain-HTML fallback page
      "app/admin/founding100-credits/page.tsx", // font-mono on order ids
    ]);
    const offenders = [...walk("app"), ...walk("components"), ...walk("lib")].filter(
      (f) => !ALLOWED.has(f) && /font-family\s*:|fontFamily\s*:|font-\[|font-mono|font-display|font-(roboto|jost|inter|georgia|helvetica)/i.test(read(f)),
    );
    expect(offenders).toEqual([]);
  });
});
