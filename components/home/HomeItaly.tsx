import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Section from "@/components/layout/Section";
import Grid from "@/components/layout/Grid";
import Eyebrow from "@/components/layout/Eyebrow";
import Heading from "@/components/layout/Heading";

// Section 08, Made in Italy: place of origin, the Fibreno/Liri water story and
// the manufacturing partner. Copy is the existing approved provenance text.
// The image is a brand scene, not a photograph of the spring, and the caption
// says so; laboratory photography does not exist yet and is flagged as pending.
// Focus Ladder direction: the page's single Red Ochre field, with the place
// name set once as vertical outline type (decorative, aria-hidden).
export default function HomeItaly() {
  return (
    <Section id="made-in-italy" labelledBy="made-in-italy-heading" className="bg-ochre text-ivory">
      <Grid className="gap-y-10">
        <p
          aria-hidden="true"
          className="vert-word out col-span-1 self-stretch font-serif text-[clamp(3.25rem,1.2rem+9vw,11rem)] leading-[0.9] tracking-[-0.01em] md:col-span-2"
        >
          Isola del Liri
        </p>

        <div className="col-span-3 md:col-span-6 lg:col-span-10 lg:col-start-3 lg:grid lg:grid-cols-2 lg:items-end lg:gap-x-gutter">
          <Reveal>
            <figure>
              <div className="relative aspect-square w-full overflow-hidden border border-ivory/40 bg-ochre">
                <Image
                  src="/assets/editorial/isola-spring-essence-square-1400.jpg"
                  alt="CHIAREL Clarity Essence bottle resting on a flat stone in clear running water"
                  width={1400}
                  height={1400}
                  sizes="(max-width: 768px) 75vw, (max-width: 1024px) 50vw, 35vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 text-caption text-ivory/90">
                Brand scene, not a photograph of the spring. Photography of the
                Natural You laboratory to follow.
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 lg:mt-0">
            <Eyebrow className="text-ivory">Isola del Liri, Italy</Eyebrow>
            <Heading level="h2" id="made-in-italy-heading" className="mt-4">
              Where Is CHIAREL™ Made?
            </Heading>
            <div className="mt-6 h-px w-24 bg-ivory/40" aria-hidden="true" />
            <p className="mt-6 max-w-measure text-body">
              Before the Liri falls through Isola del Liri as the Cascata
              Grande, it is met by the Fibreno — a river fed entirely by
              limestone karst springs, with no surface tributaries of its
              own. That confluence, water arriving newly filtered rather than
              run off the surface, is what gives this place its character:
              formulated here, with our manufacturing partner Natural You
              Srl, rather than sourced from a distance.
            </p>
            <Link
              href="/journal/isola-del-liri-waterfall"
              className="btn-press mt-8 inline-flex min-h-[44px] items-center border-b border-ivory text-eyebrow uppercase text-ivory transition-colors hover:text-champagne"
            >
              Read the Journal
            </Link>
          </Reveal>
        </div>
      </Grid>
    </Section>
  );
}
