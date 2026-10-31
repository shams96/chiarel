import Reveal from "@/components/Reveal";

// Visible FAQ — must stay in sync with the FAQPage JSON-LD built from the
// same `faqs` array in app/page.tsx. Two columns on wide screens: the heading
// stays in view on the left while the answers open on the right.
export default function HomeFaq({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <section id="faq" className="section-y-lg bg-ivory">
      <div className="mx-auto grid max-w-[84rem] gap-10 px-[clamp(1.5rem,3vw,3rem)] lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-serif text-[clamp(2.25rem,1.4rem+2.6vw,4rem)] leading-[1.05] text-garden">
            Frequently Asked Questions
          </h2>
          <div className="mt-6 h-px w-20 bg-ochre" aria-hidden="true" />
        </Reveal>
        <div className="divide-y divide-champagne border-y border-champagne">
          {faqs.map((faq, i) => (
            <Reveal key={faq.question} delay={i * 0.06}>
              <details className="group py-6">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg leading-snug text-ink md:text-xl">
                  {faq.question}
                  <span className="ml-4 shrink-0 text-xl text-ochre group-open:hidden" aria-hidden="true">+</span>
                  <span className="ml-4 hidden shrink-0 text-xl text-ochre group-open:inline" aria-hidden="true">−</span>
                </summary>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/80">{faq.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
