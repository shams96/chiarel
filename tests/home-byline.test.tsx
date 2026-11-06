// The homepage's authorship line must belong to a section, not hang alone above the footer.
// Before: a bare centred <p> after the last section (outside every container) plus an empty
// 40px email-signup wrapper, so on a wide screen the line floated by itself.
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeFinalCta } from "@/components/home/HomeClosing";
import { FORMULATOR_EXTERNAL_URL, HOMEPAGE_LAST_UPDATED_DISPLAY, HOMEPAGE_PUBLISHED_DISPLAY } from "@/lib/seo";

const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&#x27;/g, "'").trim();

describe("the authorship line closes the final section", () => {
  const html = renderToStaticMarkup(<HomeFinalCta />);

  it("is inside the section, after the call to action", () => {
    const section = html.slice(html.indexOf("<section"), html.indexOf("</section>"));
    expect(section).toContain("Written by");
    expect(section.indexOf("Written by")).toBeGreaterThan(section.indexOf("See the full House"));
  });

  it("keeps the same words, link and dates", () => {
    const t = text(html);
    expect(t).toContain(
      "Written by Grazia Savoriti , CHIAREL’s formulating pharmacist. Published August 7, 2026, last reviewed October 25, 2026.",
    );
    expect(html).toContain(`href="${FORMULATOR_EXTERNAL_URL}"`);
    expect(html).toContain('rel="noopener noreferrer"');
    expect(t).toContain(HOMEPAGE_PUBLISHED_DISPLAY);
    expect(t).toContain(HOMEPAGE_LAST_UPDATED_DISPLAY);
  });

  it("sits on the content grid with a hairline above, left-aligned, not centred full-bleed", () => {
    const p = html.slice(html.lastIndexOf("<p", html.indexOf("Written by")), html.indexOf("Written by"));
    expect(p).toContain("border-t border-hairline");
    expect(p).not.toContain("text-center");
    expect(html).toContain("max-w-[96rem] px-[clamp(1.5rem,4.5vw,7rem)]");
  });
});

describe("the page no longer leaves anything between the final section and the footer", () => {
  const page = readFileSync("app/page.tsx", "utf8");

  it("has no bare authorship paragraph of its own", () => {
    expect(page).not.toContain("Written by");
    expect(page).not.toContain("HOMEPAGE_PUBLISHED_DISPLAY");
  });

  it("renders the email-signup wrapper only when the signup is switched on", () => {
    expect(page).toMatch(/process\.env\.NEXT_PUBLIC_EMAIL_SIGNUP === "on" && \(\s*<div className="mx-auto max-w-xl px-6 pb-10">\s*<EmailSignup source="home" \/>/);
    // an unconditional wrapper around a component that returns null is the 40px ghost gap
    expect(page).not.toMatch(/<\/HomeFinalCta>|<HomeFinalCta \/>\s*<div className="mx-auto max-w-xl px-6 pb-10">/);
  });
});
