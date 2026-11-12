// The text/contrast audit (scripts/audit/audit.py) is driven by scripts/audit/routes.json.
// A hand-typed list once silently defined "every page" and missed eight of them, so this pins
// the manifest to the page files: add a page without adding it to the manifest and this fails.
// It also pins the Evening product-badge contrast fix found by that audit.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const manifest: string[] = JSON.parse(readFileSync("scripts/audit/routes.json", "utf8"));

function pageRoutes(dir = "app", prefix = ""): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name.startsWith("api") && !prefix) continue;
      out.push(...pageRoutes(p, `${prefix}/${name}`));
    } else if (name === "page.tsx") out.push(prefix || "/");
  }
  return out;
}

describe("audit route manifest", () => {
  const files = pageRoutes();
  // Dynamic segments are covered by representative URLs; admin pages sit behind login.
  const matches = (route: string) => {
    if (manifest.includes(route)) return true;
    if (route.startsWith("/admin")) return manifest.includes("/admin/login");
    if (route.includes("[")) {
      const stem = route.slice(0, route.indexOf("["));
      return manifest.some((m) => m.startsWith(stem));
    }
    return false;
  };

  it("covers every page file under app/", () => {
    const missing = files.filter((r) => !matches(r));
    expect(missing).toEqual([]);
  });

  it("includes the not-found page and the cart/checkout states", () => {
    for (const r of ["/this-page-does-not-exist", "/cart", "/checkout"]) expect(manifest).toContain(r);
  });
});

describe("product badges stay readable in Evening", () => {
  it("badges use a solid ivory surface, not a translucent one the photo shows through", () => {
    for (const f of ["components/ProductCard.tsx", "components/ProductGallery.tsx"]) {
      const src = readFileSync(f, "utf8");
      const badge = src.match(/<span className="absolute [^"]*text-ochre[^"]*"/)?.[0] ?? "";
      expect(badge, f).toContain("bg-ivory ");
      expect(badge, f).not.toContain("bg-ivory/");
    }
  });
});
