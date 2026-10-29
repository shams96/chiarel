import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import RibbonBand from "@/components/home/RibbonBand";
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

      <RibbonBand tone="redochre" />
      <section className="overflow-hidden bg-ink text-ivory">
        <div className="mx-auto grid max-w-[84rem] items-end gap-12 px-[clamp(1.5rem,3vw,3rem)] pt-20 md:grid-cols-[1.15fr_0.85fr] md:gap-16 md:pt-28">
          <Reveal className="pb-4 md:pb-28">
            <h2 className="text-[11px] font-normal uppercase tracking-[0.3em] text-champagne">
              Who Formulates CHIAREL™?
            </h2>
            <p className="mt-5 font-serif text-[clamp(2.75rem,1.4rem+5vw,6rem)] italic leading-[0.98] text-ivory">
              Grazia Savoriti
            </p>
            <div className="mt-6 h-px w-24 bg-champagne" aria-hidden="true" />
            <p className="mt-6 text-[12px] uppercase tracking-[0.2em] text-ivory/80">
              Formulated by CHIAREL&rsquo;s Pharmacist · Cosmetic &amp;
              Nutraceutical Research
            </p>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-ivory/85">
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
              className="mt-3 flex min-h-[44px] items-center text-[11px] uppercase tracking-[0.16em] text-ivory/85 hover:text-champagne"
            >
              Read her full bio →
            </Link>
            <a
              href={FORMULATOR_EXTERNAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center text-[11px] uppercase tracking-[0.16em] text-ivory/80 hover:text-champagne"
            >
              Verified profile at Natural You Srl →
            </a>
          </Reveal>

          <Reveal delay={0.12} className="mx-auto w-full max-w-[22rem] md:max-w-none">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[26rem]">
              {/* The printed CHIAREL velvet ribbon runs behind her shoulders. */}
              <div
                aria-hidden="true"
                className="absolute -left-[12%] -right-[60vw] top-[62%] h-[11%] bg-redochre bg-repeat-x"
                style={{ backgroundImage: "url(/assets/brand/ribbon-redochre.png)", backgroundSize: "auto 100%", clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 26px 50%)" }}
              />
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
        </div>
      </section>
    </>
  );
}
