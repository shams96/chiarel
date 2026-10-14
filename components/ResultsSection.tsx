import Image from "next/image";

// Real customer-testing photography, anonymized (eye bar) at the subject's
// request — no names used. The photos themselves are real and cleared to
// use; what's removed here (2026-09-16) is the per-subject product/duration
// caption line, which was hardcoded placeholder data ("2 days" for both
// subjects) never confirmed by the owner — an unverified specific claim is
// exactly what the brief's own "no fabricated evidence in production" rule
// exists to catch. Once real, confirmed product/duration data exists per
// subject, reintroduce it as a `product`/`duration` field here rather than
// guessing again.
const results = [
  {
    id: "subject-1",
    before: "/assets/testimonials/subject-1-before.jpg",
    after: "/assets/testimonials/subject-1-after.jpg",
  },
  {
    id: "subject-2",
    before: "/assets/testimonials/subject-2-before.jpg",
    after: "/assets/testimonials/subject-2-after.jpg",
  },
];

export default function ResultsSection() {
  return (
    <section className="section-y section-x">
      <p className="text-[11px] uppercase tracking-[0.18em] text-ochre">
        Customer Testing
      </p>
      <h2 className="mt-3 max-w-xl font-serif text-3xl leading-tight md:text-4xl">
        Real subjects, unretouched
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/70">
        Photography from CHIAREL&rsquo;s product testing. Eyes obscured at the
        subjects&rsquo; request — no names are used. These subjects received
        complimentary product in exchange for testing and feedback. Individual
        results vary.
      </p>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        {results.map((r) => (
          <div key={r.id}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-cloud/50">
                  <Image
                    src={r.before}
                    alt="Before — subject face, eyes obscured"
                    fill
                    sizes="(max-width: 640px) 45vw, 22vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 text-center text-[11px] uppercase tracking-[0.14em] text-ink/65">
                  Before
                </p>
              </div>
              <div>
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-cloud/50">
                  <Image
                    src={r.after}
                    alt="After — subject face, eyes obscured"
                    fill
                    sizes="(max-width: 640px) 45vw, 22vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 text-center text-[11px] uppercase tracking-[0.14em] text-ink/65">
                  After
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
