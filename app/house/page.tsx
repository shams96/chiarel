import PageHead from "@/components/layout/PageHead";
import Container from "@/components/layout/Container";

export const metadata = { title: "The House", alternates: { canonical: "/house" } };

export default function HousePage() {
  return (
    <>
      <PageHead eyebrow="CHIAREL™" lines={["The House"]} />
      <Container className="pb-section">
      <div className="grid-12">

      {/* No real photo of Isola del Liri exists in the asset library — the prior
          image here ("hero.png") was a mislabeled product-jar mockup, not a place
          photo. Deliberately text-only until real location photography exists. */}

      <div className="space-y-10 text-body text-ink/80 col-span-full lg:col-span-8 lg:col-start-5">
        <section>
          <h2 className="font-serif text-h3 text-ink">Isola del Liri</h2>
          <p className="mt-2 max-w-2xl">
            An hour and a half from Rome, in the Liri valley of central Italy,
            stands a town built around a waterfall — the Cascata Grande falls
            through Isola del Liri itself. It is here, with our manufacturing
            partner Natural You Srl, that CHIAREL™ formulations are crafted.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-h3 text-ink">A Red Drawn From the Land</h2>
          <p className="mt-2 max-w-2xl">
            Red Ochre is not a packaging colour chosen from a swatch book. It is
            the colour of Isola del Liri itself — the terracotta, clay, and
            sun-warmed stone of the Liri valley — carried into the House as
            its one signature red. The water stays water. The green stays
            green. Only the red is CHIAREL&rsquo;s.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-h3 text-ink">Mission</h2>
          <p className="mt-2 max-w-2xl">
            Advancing Cellular Clarity™ — supporting the skin&rsquo;s own
            intelligence against Modern Biological Stress™, with restraint,
            precision, and respect for the skin&rsquo;s biology.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-h3 text-ink">Modern Biological Stress™</h2>
          <p className="mt-2 max-w-2xl">
            A working woman&rsquo;s day asks a great deal of her body and her
            skin. Early starts, deadlines, screens, commutes, dry indoor air
            and too little sleep add up. We call this Modern Biological
            Stress™. Skin shows it first: it feels tighter, looks duller and
            lines look more defined. CHIAREL™ is made to help skin look and
            feel clear, comfortable and rested through that day. This is our
            mission, Advancing Cellular Clarity™.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-h3 text-ink">Clarity</h2>
          <p className="mt-2 max-w-2xl">
            Five formulations, each made for one purpose. Each carries the name
            of our mission: Clarity.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-h3 text-ink">La Bella Figura</h2>
          <p className="mt-2 max-w-2xl">
            The Italian art of presenting one&rsquo;s best self — not vanity,
            but discipline and quiet confidence. It is the cultural philosophy
            of the House: skincare as a considered daily practice, never a
            performance.
          </p>
        </section>
        <section className="border-t border-ink/10 pt-10">
          <h2 className="font-serif text-h3 text-ink">Formulated By</h2>
          <p className="mt-2 max-w-2xl">
            Natural You Srl is guided by Grazia Savoriti, a pharmacist with
            deep expertise in cosmetic and nutraceutical research and
            development. It is under her guidance that every CHIAREL™
            formulation is developed and produced, in Isola del Liri.{" "}
            <a
              href="https://www.naturalyou.it/about-us-detail/"
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-ochre text-ochre"
            >
              See her profile at Natural You Srl
            </a>
            .
          </p>
        </section>
        <section className="border-t border-ink/10 pt-10">
          <h2 className="font-serif text-h3 text-ink">A Considered Practice</h2>
          <p className="mt-2 max-w-2xl">
            Small, made-to-order batches. Glass bottles and jars. Every active
            ingredient disclosed.
          </p>
        </section>
      </div>
      </div>
      </Container>
    </>
  );
}
