import Reveal from "@/components/Reveal";
import { RoutineBand, morningRoute, eveningRoute } from "@/components/RoutineBand";

// The visible Step lists below must stay in sync with amRitualHowTo /
// pmRitualHowTo in app/page.tsx (HowTo JSON-LD mirrors this copy exactly).
export default function HomeRitual() {
  return (
    <section id="five-product-ritual" className="bg-ivory">
      <div className="section-x pb-10 pt-20 md:pb-12 md:pt-24">
        <Reveal>
          <h2 className="font-serif text-3xl">The CHIAREL Ritual</h2>
          <p className="mt-4 max-w-2xl text-sm text-ink/70">
            Five products, two moments in the day: prepare for it, then let it go.
          </p>
        </Reveal>
      </div>
      <RoutineBand
        variant="compact"
        id="home-morning"
        time="Morning"
        title="The Morning Ritual"
        steps={[
          { n: 1, label: "Clarity Essence" },
          { n: 2, label: "Clarity Day Crème" },
        ]}
        slugs={morningRoute}
      />
      <RoutineBand
        variant="compact"
        id="home-evening"
        time="Evening"
        title="The Evening Ritual"
        dark
        steps={[
          { n: 1, label: "Clarity Essence" },
          { n: 2, label: "Clarity Eye Contour Concentrate" },
          { n: 3, label: "Clarity Night Crème" },
          { n: 4, label: "Clarity Neck & Décolleté Crème" },
        ]}
        slugs={eveningRoute}
      />
      <div className="section-x py-6 md:py-8" />
    </section>
  );
}
