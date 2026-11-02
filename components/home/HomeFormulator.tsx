import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Section from "@/components/layout/Section";
import Grid from "@/components/layout/Grid";
import Eyebrow from "@/components/layout/Eyebrow";
import Heading from "@/components/layout/Heading";
import { FORMULATOR_EXTERNAL_URL } from "@/lib/seo";

// Section 09, The Formulator: existing approved wording and links only. The
// portrait is the live cutout; no larger use until Natural You's written
// permission is confirmed (spec D8).
export default function HomeFormulator() {
  return (
    <Section id="formulator" rule labelledBy="formulator-heading" className="bg-ivory">
      <Grid className="items-end gap-y-10">
        <Reveal className="col-span-4 md:col-span-5 lg:col-span-6">
          <Eyebrow className="text-ochre">The Formulator</Eyebrow>
          <Heading level="h4" as="h2" id="formulator-heading" className="mt-4 text-ink/80">
            Who Formulates CHIAREL™?
          </Heading>
          <p className="mt-4 font-serif text-display italic text-ink">
            Grazia Savoriti
          </p>
          <div className="mt-6 h-px w-24 bg-ink/20" aria-hidden="true" />
          <p className="mt-6 text-eyebrow uppercase text-ink/80">
            Formulated by CHIAREL&rsquo;s Pharmacist · Cosmetic &amp;
            Nutraceutical Research
          </p>
          <p className="mt-6 max-w-measure text-body text-ink/80">
            Every CHIAREL™ formulation is developed under her guidance and
            produced in small, fresh batches in Isola del Liri — made to
            order rather than held in standing inventory.
          </p>
          <Link
            href="/science"
            className="mt-8 inline-block border-b border-ochre pb-0.5 text-eyebrow uppercase text-ochre transition-colors hover:text-ink"
          >
            Explore the Science
          </Link>
          <Link
            href="/house"
            className="mt-3 flex min-h-[44px] items-center text-[12px] uppercase tracking-[0.16em] text-ink/80 hover:text-ochre"
          >
            Read her full bio →
          </Link>
          <a
            href={FORMULATOR_EXTERNAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center text-[12px] uppercase tracking-[0.16em] text-ink/80 hover:text-ochre"
          >
            Verified profile at Natural You Srl →
          </a>
        </Reveal>

        <Reveal
          delay={0.12}
          className="col-span-4 mx-auto w-full max-w-[26rem] md:col-span-3 md:max-w-none lg:col-span-5 lg:col-start-8"
        >
          <div className="relative aspect-[4/5] w-full border border-ink/15 bg-cloud">
            <Image
              src="/assets/house/grazia-savoriti-cutout.webp"
              alt="Grazia Savoriti, CHIAREL's formulating pharmacist"
              width={592}
              height={524}
              sizes="(max-width: 768px) 22rem, 26rem"
              className="absolute bottom-0 left-1/2 w-[96%] max-w-none -translate-x-1/2"
            />
          </div>
        </Reveal>
      </Grid>
    </Section>
  );
}
