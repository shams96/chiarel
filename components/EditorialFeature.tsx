import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

// Full-width editorial band: portrait scene photograph beside a short caption.
// Used on the product page and the home page so campaign imagery reads the same
// in both places. Copy is passed in, never invented here.
export default function EditorialFeature({
  src,
  alt,
  kicker,
  headline,
  body,
  href,
  cta,
  flip = false,
}: {
  src: string;
  alt: string;
  kicker: string;
  headline: string;
  body?: string;
  href?: string;
  cta?: string;
  flip?: boolean;
}) {
  return (
    <section className="section-y border-y border-ink/10 bg-ivory">
      <div className="section-x grid items-center gap-8 md:grid-cols-2 md:gap-16">
        <Reveal className={flip ? "md:order-2" : undefined}>
          <div className="relative mx-auto aspect-[2/3] w-full max-w-md overflow-hidden">
            <Image src={src} alt={alt} fill sizes="(max-width: 768px) 90vw, 448px" className="object-cover" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ochre">{kicker}</p>
          <h2 className="mt-3 font-serif text-3xl leading-snug md:text-4xl">{headline}</h2>
          {body && <p className="mt-5 max-w-md text-sm leading-relaxed text-ink/70">{body}</p>}
          {href && cta && (
            <Link
              href={href}
              className="btn-press mt-8 inline-block border border-ink px-8 py-3 text-[12px] uppercase tracking-[0.3em] text-ink transition hover:border-ochre hover:text-ochre"
            >
              {cta}
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}
