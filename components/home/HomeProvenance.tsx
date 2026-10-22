import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { FORMULATOR_EXTERNAL_URL } from "@/lib/seo";

// Provenance (Isola del Liri) followed by the formulator.
export default function HomeProvenance() {
  return (
    <>
      <section className="relative section-y overflow-hidden border-y border-ink/10 text-ivory">
        <Image
          src="/assets/editorial/isola-del-liri-cascata.jpg"
          alt="Editorial illustration of the Cascata Grande waterfall running through Isola del Liri, Italy"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-garden/85" />
        <Reveal className="section-x-narrow relative text-center">
          <h2 className="font-serif text-4xl leading-tight md:text-5xl">
            Where Is CHIAREL™ Made?
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ivory/75">
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
            className="btn-press mt-6 inline-block border-b border-champagne pb-0.5 text-[12px] uppercase tracking-[0.18em] text-champagne transition-colors hover:text-ivory"
          >
            Read the Journal
          </Link>
        </Reveal>
      </section>

      <section className="relative section-y-lg overflow-hidden bg-ink text-ivory">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 50% 35%, rgba(214,197,160,0.16), transparent 70%)",
          }}
        />
        <Reveal className="section-x-narrow relative text-center">
          <h2 className="font-serif text-4xl leading-snug">Who Formulates CHIAREL™?</h2>
          <p className="mt-3 font-serif text-xl text-champagne">Grazia Savoriti</p>
          <p className="mt-2 text-[12px] uppercase tracking-[0.2em] text-ivory/50">
            Formulated by CHIAREL&rsquo;s Pharmacist · Cosmetic &amp;
            Nutraceutical Research
          </p>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-ivory/75">
            Every CHIAREL™ formulation is developed under her guidance and
            produced in small, fresh batches in Isola del Liri — made to
            order rather than held in standing inventory.
          </p>
          <Link
            href="/science"
            className="mt-8 inline-block border-b border-champagne pb-0.5 text-[12px] uppercase tracking-[0.18em] text-champagne"
          >
            Explore the Science
          </Link>
          <Link
            href="/house"
            className="mt-3 flex min-h-[44px] items-center text-[11px] uppercase tracking-[0.16em] text-ivory/70 hover:text-champagne"
          >
            Read her full bio →
          </Link>
          <a
            href={FORMULATOR_EXTERNAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center text-[11px] uppercase tracking-[0.16em] text-ivory/60 hover:text-champagne"
          >
            Verified profile at Natural You Srl →
          </a>
        </Reveal>
      </section>
    </>
  );
}
