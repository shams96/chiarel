import Link from "next/link";
import Reveal from "@/components/Reveal";
import ResultsSection from "@/components/ResultsSection";

const pubmedLink =
  "mt-1 inline-block border-b border-ink/30 text-[12px] text-ink/65 hover:border-ochre hover:text-ochre";

// Proof, second: customer testing photography, then only currently
// supported, real citations. Keep the N1 "no product-specific testing
// results" statement — it is a compliance/honesty requirement.
export default function HomeProof() {
  return (
    <>
      <ResultsSection />

      <section className="section-y bg-ivory">
        <div className="section-x-narrow">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl">Backed by Published Research</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink/70">
              CHIAREL formulates with established, clinically studied
              ingredients — not novel, unstudied compounds. Each mechanism
              cited below is documented in peer-reviewed clinical and
              cosmetic-science literature, reviewed by our formulating
              pharmacist, not brand-authored claims.
            </p>
          </Reveal>
          <ul className="mx-auto mt-10 max-w-xl space-y-4 text-sm">
            <li className="border-l-2 border-ochre pl-5">
              <p className="text-ink/70">
                Palmitoyl Pentapeptide-4 (used in CHIAREL Essence™) is studied
                for its role in visible firmness and texture support.
              </p>
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/?term=palmitoyl+pentapeptide+skin"
                target="_blank"
                rel="noopener noreferrer"
                className={pubmedLink}
              >
                Published research, PubMed (NIH) →
              </a>
            </li>
            <li className="border-l-2 border-ochre pl-5">
              <p className="text-ink/70">
                Ceramide NP and Niacinamide (used in Terra Radiance Crème™)
                are widely studied for barrier support and environmental
                defense.
              </p>
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/?term=ceramide+niacinamide+skin+barrier"
                target="_blank"
                rel="noopener noreferrer"
                className={pubmedLink}
              >
                Published research, PubMed (NIH) →
              </a>
            </li>
            <li className="border-l-2 border-ochre pl-5">
              <p className="text-ink/70">
                Bioactive Ferment Lysate — a postbiotic used across the
                ritual — is studied for supporting barrier proteins and
                microbiome balance. See the full mechanism explainer.
              </p>
              <Link
                href="/science/bifida-ferment-lysate"
                className="mt-1 inline-block border-b border-ochre text-[12px] text-ochre"
              >
                Read the formulation science →
              </Link>
            </li>
            <li className="border-l-2 border-ochre pl-5">
              <p className="text-ink/70">
                L-Ornithine (used in Recovery Masque™) is studied for its
                role in the skin&rsquo;s Natural Moisturizing Factor and overnight
                barrier repair.
              </p>
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/?term=ornithine+skin+barrier"
                target="_blank"
                rel="noopener noreferrer"
                className={pubmedLink}
              >
                Published research, PubMed (NIH) →
              </a>
            </li>
            <li className="border-l-2 border-ochre pl-5">
              <p className="text-ink/70">
                Low molecular weight Hyaluronic Acid (used in Cellular Mist™)
                is studied for fast-absorbing surface hydration ahead of
                treatment.
              </p>
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/?term=low+molecular+weight+hyaluronic+acid+skin+hydration"
                target="_blank"
                rel="noopener noreferrer"
                className={pubmedLink}
              >
                Published research, PubMed (NIH) →
              </a>
            </li>
          </ul>
          <p className="mx-auto mt-6 max-w-xl text-[12px] leading-relaxed text-ink/60">
            N1 Neck &amp; Décolleté Renewal Emulsion has no product-specific
            testing results published yet — see its product page for status.
          </p>
        </div>
      </section>
    </>
  );
}
