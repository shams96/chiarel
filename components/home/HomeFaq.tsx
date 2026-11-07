import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/layout/SectionHeading";
import { FORMULATOR_EXTERNAL_URL, HOMEPAGE_LAST_UPDATED_DISPLAY, HOMEPAGE_PUBLISHED_DISPLAY } from "@/lib/seo";

// Visible FAQ — must stay in sync with the FAQPage JSON-LD built from the
// same `faqs` array in app/page.tsx. Two columns on wide screens: the heading
// stays in view on the left while the answers open on the right.
export default function HomeFaq({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <section id="faq" className="section-y-lg bg-cloud">
      <div className="mx-auto grid w-full max-w-container gap-10 px-margin lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading>Frequently Asked Questions</SectionHeading>
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
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink">{faq.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
      {/* The page's authorship line (who wrote it, when published and reviewed).
          It closes the last content section so nothing sits alone above the footer.
          Wording, link and dates are owned by lib/seo.ts. */}
      <div className="mx-auto mt-14 w-full max-w-container px-margin md:mt-20">
        <p className="max-w-[44rem] border-t border-hairline pt-5 text-[12px] leading-relaxed text-ink">
          Written by{" "}
          <a
            href={FORMULATOR_EXTERNAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-ink/30 hover:border-ochre hover:text-ochre"
          >
            Grazia Savoriti
          </a>
          , CHIAREL&rsquo;s formulating pharmacist. Published {HOMEPAGE_PUBLISHED_DISPLAY}, last
          reviewed {HOMEPAGE_LAST_UPDATED_DISPLAY}.
        </p>
      </div>
    </section>
  );
}
