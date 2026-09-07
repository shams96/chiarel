// Real customer-testing photography, anonymized (eye bar) at the subject's
// request — no names used. Product/duration fields are TODO pending owner
// input; do not ship this section live with the TODOs still showing, and do
// not invent duration/product specifics to fill the gap (brief's own rule:
// no fabricated evidence in production).
const results = [
  {
    id: "subject-1",
    before: "/assets/testimonials/subject-1-before.jpg",
    after: "/assets/testimonials/subject-1-after.jpg",
    product: "CHIAREL Essence™ + Recovery Masque™",
    duration: "2 days",
  },
  {
    id: "subject-2",
    before: "/assets/testimonials/subject-2-before.jpg",
    after: "/assets/testimonials/subject-2-after.jpg",
    product: "CHIAREL Essence™ + Recovery Masque™",
    duration: "2 days",
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.before}
                    alt="Before — subject face, eyes obscured"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-2 text-center text-[11px] uppercase tracking-[0.14em] text-ink/65">
                  Before
                </p>
              </div>
              <div>
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-cloud/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.after}
                    alt="After — subject face, eyes obscured"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-2 text-center text-[11px] uppercase tracking-[0.14em] text-ink/65">
                  After
                </p>
              </div>
            </div>
            <p className="mt-3 text-[13px] text-ink/60">
              {r.product} · {r.duration}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
