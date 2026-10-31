import Reveal from "@/components/Reveal";
import Section from "@/components/layout/Section";
import Grid from "@/components/layout/Grid";
import Eyebrow from "@/components/layout/Eyebrow";
import Heading from "@/components/layout/Heading";
import { formulationLine } from "@/lib/formulation-line";

// Section 02, Brand Philosophy: the approach in two approved statements only
// (the mission line and the formulation line). No new claims are introduced here.
export default function HomeIntro() {
  return (
    <Section id="philosophy" labelledBy="philosophy-heading">
      <Grid className="gap-y-6">
        <Reveal className="col-span-4 md:col-span-3 lg:col-span-3">
          <Eyebrow className="text-ochre">
            <span id="philosophy-heading">The Approach</span>
          </Eyebrow>
        </Reveal>
        <Reveal
          delay={0.08}
          className="col-span-4 md:col-span-5 lg:col-span-8 lg:col-start-5"
        >
          <Heading level="h2" as="h2">
            Advancing Cellular Clarity™ against Modern Biological Stress™.
          </Heading>
          <p className="mt-6 max-w-measure text-lead text-ink/80">
            {formulationLine()}
          </p>
        </Reveal>
      </Grid>
    </Section>
  );
}
