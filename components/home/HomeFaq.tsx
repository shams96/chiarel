import Reveal from "@/components/Reveal";

// Visible FAQ — must stay in sync with the FAQPage JSON-LD built from the
// same `faqs` array in app/page.tsx.
export default function HomeFaq({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <section id="faq" className="section-y bg-ivory">
      <div className="section-x-narrow">
        <Reveal>
          <h2 className="text-center font-serif text-3xl">Frequently Asked Questions</h2>
        </Reveal>
        <div className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
          {faqs.map((faq, i) => (
            <Reveal key={faq.question} delay={i * 0.06}>
              <details className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg leading-snug text-ink">
                  {faq.question}
                  <span className="ml-4 shrink-0 text-xl text-ink/50 group-open:hidden" aria-hidden="true">+</span>
                  <span className="ml-4 hidden shrink-0 text-xl text-ink/50 group-open:inline" aria-hidden="true">−</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{faq.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
