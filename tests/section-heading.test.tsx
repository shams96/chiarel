import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SectionHeading from "@/components/layout/SectionHeading";

describe("SectionHeading", () => {
  it("renders an ochre h2 on the h2 token with the thin ochre rule above", () => {
    const html = renderToStaticMarkup(<SectionHeading>The Face, First</SectionHeading>);
    expect(html).toContain("border-t border-ochre");
    expect(html).toMatch(/<h2[^>]*class="[^"]*font-serif[^"]*text-h2[^"]*text-ochre/);
    expect(html).toContain("The Face, First");
  });

  it("adds an italic subhead and a lead only when given", () => {
    const bare = renderToStaticMarkup(<SectionHeading>X</SectionHeading>);
    expect(bare).not.toContain("italic");
    const full = renderToStaticMarkup(
      <SectionHeading subhead="We begin where you are most seen." lead="Four formulas.">X</SectionHeading>,
    );
    expect(full).toMatch(/<p[^>]*italic[^>]*>We begin where you are most seen\./);
    expect(full).toContain("Four formulas.");
  });

  it("keeps the semantic level independent of the look and can drop the rule", () => {
    const html = renderToStaticMarkup(<SectionHeading as="h3" rule={false} id="x">Y</SectionHeading>);
    expect(html).toMatch(/<h3[^>]*id="x"[^>]*text-h2/);
    expect(html).not.toContain("border-t");
  });

  it("uses tokens only: no ad hoc clamp() size and no font override", () => {
    const html = renderToStaticMarkup(<SectionHeading subhead="s" lead="l">Z</SectionHeading>);
    expect(html).not.toMatch(/clamp\(/);
    expect(html).not.toMatch(/font-(sans|mono)|style=/);
  });
});
