import ResponsiveImage from "@/components/ResponsiveImage";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Section from "@/components/layout/Section";
import Grid from "@/components/layout/Grid";
import Eyebrow from "@/components/layout/Eyebrow";

// Section 10, The House: the origin quote and philosophy, a photograph of the
// town on one side and the quote, set large, on the other. Copy unchanged.
export function HomePhilosophy() {
  return (
    <Section id="the-house" rule labelledBy="the-house-heading">
      <Grid className="items-center gap-y-10">
        <Reveal className="col-span-4 md:col-span-3 lg:col-span-4">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[26rem] overflow-hidden bg-ivory">
            <ResponsiveImage
              src="/assets/journal/isola-del-liri-bridge.jpg"
              alt="A woman in white on the old bridge at Isola del Liri, with the Cascata Grande and the castle behind her"
              sizes="(max-width: 768px) 90vw, 26rem"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal
          delay={0.1}
          className="col-span-4 md:col-span-5 lg:col-span-7 lg:col-start-6"
        >
          <Eyebrow className="text-ochre">
            <span id="the-house-heading">The House</span>
          </Eyebrow>
          <p className="mt-6 border-l-2 border-ochre pl-6 font-serif text-h3 text-ink md:text-h2">
            &ldquo;Skin is not one thing. A house built to serve it should not
            pretend otherwise.&rdquo;
          </p>
          <p className="mt-8 max-w-measure text-body text-ink/80">
            CHIAREL Intelligence™ began as a question at a kitchen table —
            the working method still holds: start with the biology in front
            of you, formulate it properly, and name the ingredients that
            matter. Advancing Cellular Clarity™ against Modern Biological
            Stress™ is the mission behind every formula. It is
            the same discipline behind La Bella Figura — presenting one&rsquo;s
            best self, quietly, without announcement.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-7">
            <Link
              href="/journal/three-skins-one-house"
              className="btn-press inline-block border-b border-ochre pb-0.5 text-eyebrow uppercase text-ochre"
            >
              Read the Origin Story
            </Link>
            <Link
              href="/house"
              className="btn-press inline-block border-b border-ochre pb-0.5 text-eyebrow uppercase text-ochre"
            >
              Discover the House
            </Link>
          </div>
        </Reveal>
      </Grid>
    </Section>
  );
}
