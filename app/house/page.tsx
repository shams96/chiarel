export const metadata = { title: "The House", alternates: { canonical: "/house" } };

export default function HousePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-serif text-4xl">The House</h1>

      {/* No real photo of Isola del Liri exists in the asset library — the prior
          image here ("hero.png") was a mislabeled product-jar mockup, not a place
          photo. Deliberately text-only until real location photography exists. */}

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-ink/80">
        <section>
          <h2 className="font-serif text-2xl text-ink">Isola del Liri</h2>
          <p className="mt-2 max-w-2xl">
            An hour and a half from Rome, in the Liri valley of central Italy,
            stands a town built around a waterfall — the Cascata Grande falls
            through Isola del Liri itself. It is here, with our manufacturing
            partner Natural You Srl, that CHIAREL™ formulations are crafted.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-ink">Mission</h2>
          <p className="mt-2 max-w-2xl">
            Advancing Cellular Clarity™ — supporting the skin&rsquo;s own
            intelligence against Modern Biological Stress™, with restraint,
            precision, and respect for the skin&rsquo;s biology.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-ink">La Bella Figura</h2>
          <p className="mt-2 max-w-2xl">
            The Italian art of presenting one&rsquo;s best self — not vanity,
            but discipline and quiet confidence. It is the cultural philosophy
            of the House: skincare as a considered daily practice, never a
            performance.
          </p>
        </section>
        <section className="border-t border-ink/10 pt-10">
          <h2 className="font-serif text-2xl text-ink">Formulated By</h2>
          <p className="mt-2 max-w-2xl">
            Natural You Srl is guided by Grazia Savoriti, a pharmacist with
            deep expertise in cosmetic and nutraceutical research and
            development. It is under her guidance that every CHIAREL™
            formulation is developed and produced, in Isola del Liri.
          </p>
        </section>
        <section className="border-t border-ink/10 pt-10">
          <h2 className="font-serif text-2xl text-ink">A Considered Practice</h2>
          <p className="mt-2 max-w-2xl">
            Every formulation is produced in small, fresh batches — made to
            order rather than held in standing inventory, reducing
            overproduction by design. Packaging is glass, chosen for
            recyclability and to preserve the formulation properly; delivery
            systems are airless, protecting the actives inside and
            minimizing waste. Ingredients are vegan-friendly and
            cruelty-free.
          </p>
        </section>
      </div>
    </div>
  );
}
