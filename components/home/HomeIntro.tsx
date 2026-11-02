import Reveal from "@/components/Reveal";
import Section from "@/components/layout/Section";
import Grid from "@/components/layout/Grid";
import Eyebrow from "@/components/layout/Eyebrow";
import { formulationLine } from "@/lib/formulation-line";

// Section 02, Brand Philosophy: the approach in two approved statements only
// (the mission line and the formulation line). No new claims are introduced here.
// Focus Ladder direction: the statement is poster-scale display type whose
// second line steps right across the grid; the formulation line sits to the
// right on the 12-column grid.
export default function HomeIntro() {
  return (
    <Section id="philosophy" labelledBy="philosophy-heading">
      <Grid className="gap-y-6">
        <Reveal className="col-span-full">
          <Eyebrow className="text-ochre">
            <span id="philosophy-heading">The Approach</span>
          </Eyebrow>
        </Reveal>
        <Reveal delay={0.08} className="grid-12 col-span-full">
          <h2 className="stagger font-serif text-mega">
            <span>Advancing Cellular Clarity™ </span>
            <span>against Modern Biological Stress™.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.16} className="col-span-full mt-4 lg:col-span-4 lg:col-start-9 lg:mt-6">
          <p className="max-w-measure text-lead text-ink/80">{formulationLine()}</p>
        </Reveal>
      </Grid>
    </Section>
  );
}
