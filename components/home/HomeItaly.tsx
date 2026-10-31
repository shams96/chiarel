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
export default function HomeItaly() {
  return (
    <Section id="made-in-italy" rule labelledBy="made-in-italy-heading">
      <Grid className="items-center gap-y-10">
        <Reveal className="col-span-4 md:col-span-4 lg:col-span-5">
          <figure>
            <div className="relative aspect-square w-full overflow-hidden bg-ivory">
              <Image
                src="/assets/editorial/isola-spring-essence-square-1400.jpg"
                alt="CHIAREL Clarity Essence bottle resting on a flat stone in clear running water"
                width={1400}
                height={1400}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 text-caption text-ink/70">
              Brand scene, not a photograph of the spring. Photography of the
              Natural You laboratory to follow.
            </figcaption>
          </figure>
        </Reveal>

        <Reveal
          delay={0.1}
          className="col-span-4 md:col-span-4 lg:col-span-6 lg:col-start-7"
        >
          <Eyebrow className="text-ochre">Isola del Liri, Italy</Eyebrow>
          <Heading level="h2" id="made-in-italy-heading" className="mt-4">
            Where Is CHIAREL™ Made?
          </Heading>
          <div className="mt-6 h-px w-24 bg-ink/20" aria-hidden="true" />
          <p className="mt-6 max-w-measure text-body text-ink/80">
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
            className="btn-press mt-8 inline-block border-b border-ochre pb-0.5 text-eyebrow uppercase text-ochre transition-colors hover:text-ink"
          >
            Read the Journal
          </Link>
        </Reveal>
      </Grid>
    </Section>
  );
}
