import PageHead from "@/components/layout/PageHead";
import Image from "next/image";
import Container from "@/components/layout/Container";

export const metadata = {
  title: "The House",
  description:
    "Isola del Liri, in the Liri valley of central Italy, where CHIAREL™ formulations are crafted with our manufacturing partner Natural You Srl.",
  alternates: { canonical: "/house" },
};

export default function HousePage() {
  return (
    <>
      <PageHead lines={["The House"]} />
      <Container className="pb-section">
      <div className="grid-12">

      {/* Rail image is the Isola del Liri brand scene already used on the home page;
          it is a brand scene, not a photograph of the town (see its caption). */}
      <aside className="col-span-full mb-6 lg:col-span-3 lg:mb-0 lg:sticky lg:top-24 lg:self-start">
        <figure>
          <div className="relative aspect-square w-full overflow-hidden lg:aspect-[4/5] border border-ink/10 bg-cloud">
            <Image
              src="/assets/editorial/isola-spring-essence-square-1400.jpg"
              alt="CHIAREL Clarity Essence bottle resting on a flat stone in clear running water"
              width={1400}
              height={1400}
              sizes="(max-width: 1024px) 100vw, 25vw"
              className="h-full w-full object-cover"
            />
          </div>
        </figure>
      </aside>

      <div className="text-body text-ink col-span-full lg:col-span-8 lg:col-start-5">
        <section className="border-t border-ink/10 pt-10 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-10">
          <h2 className="font-serif text-h3 text-ochre">Isola del Liri</h2>
          <p className="mt-2 max-w-2xl">
            An hour and a half from Rome, in the Liri valley of central Italy,
            stands a town built around a waterfall — the Cascata Grande falls
            through Isola del Liri itself. It is here, with our manufacturing
            partner Natural You Srl, that CHIAREL™ formulations are crafted.
          </p>
        </section>
        <section className="border-t border-ink/10 pt-10 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-10">
          <h2 className="font-serif text-h3 text-ochre">A Red Drawn From the Land</h2>
          <p className="mt-2 max-w-2xl">
            Red Ochre is not a packaging colour chosen from a swatch book. It is
            the colour of Isola del Liri itself — the terracotta, clay, and
            sun-warmed stone of the Liri valley — carried into the House as
            its one signature red. The water stays water. The green stays
            green. Only the red is CHIAREL&rsquo;s.
          </p>
        </section>
        <section className="border-t border-ink/10 pt-10 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-10">
          <h2 className="font-serif text-h3 text-ochre">Mission</h2>
          <p className="mt-2 max-w-2xl">
            Advancing Cellular Clarity™ — supporting the skin&rsquo;s own
            intelligence against Modern Biological Stress™, with restraint,
            precision, and respect for the skin&rsquo;s biology.
          </p>
        </section>
        <section className="border-t border-ink/10 pt-10 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-10">
          <h2 className="font-serif text-h3 text-ochre">Modern Biological Stress™</h2>
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
        <section className="border-t border-ink/10 pt-10 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-10">
          <h2 className="font-serif text-h3 text-ochre">Clarity</h2>
          <p className="mt-2 max-w-2xl">
            Five formulations, each made for one purpose. Each carries the name
            of our mission: Clarity.
          </p>
        </section>
        <section className="border-t border-ink/10 pt-10 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-10">
          <h2 className="font-serif text-h3 text-ochre">La Bella Figura</h2>
          <p className="mt-2 max-w-2xl">
            The Italian art of presenting one&rsquo;s best self — not vanity,
            but discipline and quiet confidence. It is the cultural philosophy
            of the House: skincare as a considered daily practice, never a
            performance.
          </p>
        </section>
        <section className="border-t border-ink/10 pt-10 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-10">
          <h2 className="font-serif text-h3 text-ochre">Formulated By</h2>
          <p className="mt-2 max-w-2xl">
            Natural You Srl is guided by Grazia Savoriti, a pharmacist with
            deep expertise in cosmetic and nutraceutical research and
            development. Every CHIAREL™
            formulation is developed by the House of CHIAREL as a team effort, and produced in Isola del Liri.{" "}
            <a
              href="https://www.naturalyou.it/about-us-detail/"
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-ochre text-ochre"
            >
              See her profile at Natural You Srl<span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </section>
        <section className="border-t border-ink/10 pt-10 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-10">
          <h2 className="font-serif text-h3 text-ochre">A Considered Practice</h2>
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
