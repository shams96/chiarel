import Image from "next/image";

export const metadata = { title: "The House — CHIAREL™" };

export default function HousePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="eyebrow">Provenance</p>
      <h1 className="mt-2 font-serif text-4xl">The House</h1>

      <div className="relative mt-10 aspect-[21/9] overflow-hidden rounded-sm">
        <Image
          src="/assets/editorial/hero.png"
          alt="CHIAREL™ at Isola del Liri"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

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
      </div>
    </div>
  );
}
