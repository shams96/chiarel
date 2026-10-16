import Link from "next/link";
import Reveal from "@/components/Reveal";
import { RoutineBand, morningRoute, eveningRoute } from "@/components/RoutineBand";

// The visible Step lists below must stay in sync with amRitualHowTo /
// pmRitualHowTo in app/page.tsx (HowTo JSON-LD mirrors this copy exactly).
// The optional Eye step in the Evening band is deliberately NOT a numbered
// step and is not in the JSON-LD.
export default function HomeRitual() {
  return (
    <section id="four-product-ritual" className="bg-ivory">
      <div className="section-x pb-10 pt-20 md:pb-12 md:pt-24">
        <Reveal>
          <h2 className="font-serif text-3xl">The CHIAREL Ritual</h2>
          <p className="mt-4 max-w-2xl text-sm text-ink/70">
            A focused morning and evening practice for hydration, comfort,
            renewal, and the skin below the jawline.
          </p>
        </Reveal>
      </div>
      <RoutineBand
        variant="compact"
        id="home-morning"
        time="Morning"
        title="The Morning Ritual"
        steps={[
          { n: 1, label: "CHIAREL Essence™" },
          { n: 2, label: "Terra Radiance Crème™" },
        ]}
        slugs={morningRoute}
      />
      <RoutineBand
        variant="compact"
        id="home-evening"
        time="Evening"
        title="The Evening Ritual"
        dark
        withEye
        steps={[
          { n: 1, label: "CHIAREL Essence™" },
          { n: 2, label: "Recovery Masque™" },
          { n: 3, label: "N1 Neck & Décolleté Renewal Emulsion™" },
        ]}
        slugs={eveningRoute}
      />
      <div className="section-x py-8 md:py-10">
        <p className="max-w-2xl text-[13px] leading-relaxed text-ink/65">
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
