import Link from "next/link";
import RitualCarousel from "@/components/RitualCarousel";
import Reveal from "@/components/Reveal";
import { launchRitualProducts } from "@/lib/products";

// The visible Step lists below must stay in sync with amRitualHowTo /
// pmRitualHowTo in app/page.tsx (HowTo JSON-LD mirrors this copy exactly).
export default function HomeRitual() {
  return (
    <section id="four-product-ritual" className="section-y bg-ivory">
      <div className="section-x">
        <Reveal>
          <h2 className="font-serif text-3xl">The CHIAREL Ritual</h2>
          <p className="mt-4 max-w-2xl text-sm text-ink/70">
            A focused morning and evening practice for hydration, comfort,
            renewal, and the skin below the jawline.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink/65">Morning</p>
            <ol className="mt-3 flex flex-wrap items-baseline gap-x-2 font-serif text-xl leading-snug">
              <li><span className="text-ochre">Step 1</span> CHIAREL Essence™</li>
              <li aria-hidden="true" className="text-ink/40">→</li>
              <li><span className="text-ochre">Step 2</span> Terra Radiance Crème™</li>
            </ol>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink/65">Evening</p>
            <ol className="mt-3 flex flex-wrap items-baseline gap-x-2 font-serif text-xl leading-snug">
              <li><span className="text-ochre">Step 1</span> CHIAREL Essence™</li>
              <li aria-hidden="true" className="text-ink/40">→</li>
              <li><span className="text-ochre">Step 2</span> Recovery Masque™</li>
              <li aria-hidden="true" className="text-ink/40">→</li>
              <li><span className="text-ochre">Step 3</span> N1 Neck &amp; Décolleté Renewal Emulsion™</li>
            </ol>
          </div>
        </div>
        <RitualCarousel products={launchRitualProducts} />
        <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-ink/65">
          Cellular Cleanser™ and Cellular Mist™ remain available as{" "}
          <Link href="/ritual#optional-preparation" className="border-b border-ochre text-ochre">
            optional preparation
          </Link>{" "}
          ahead of either routine.
        </p>
      </div>
    </section>
  );
}
