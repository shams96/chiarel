import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const header = readFileSync("components/Header.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

describe("announcement ticker can be paused", () => {
  it("has a labelled toggle button that is not inside the link", () => {
    expect(header).toContain("aria-pressed={tickerPaused}");
    expect(header).toMatch(/Pause announcement rotation/);
    expect(header).toMatch(/Resume announcement rotation/);
    // button follows the closing </Link> of the ticker link, as a sibling
    const afterLink = header.slice(header.indexOf("<Ticker />"));
    expect(afterLink.indexOf("</Link>")).toBeLessThan(afterLink.indexOf("<button"));
  });
  it("pausing freezes on the first message and stops the pulse", () => {
    expect(css).toMatch(/\.ticker-paused \.ticker-msg\s*{[^}]*animation: none/);
    expect(css).toMatch(/\.ticker-paused \.ticker-msg:first-child\s*{[^}]*opacity: 1/);
    expect(css).toMatch(/\.ticker-paused \.animate-ping\s*{[^}]*animation: none/);
  });
});
