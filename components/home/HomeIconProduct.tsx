import ResponsiveImage from "@/components/ResponsiveImage";
import Link from "next/link";
import Reveal from "@/components/Reveal";

// The Home "icon product" moment: a full-bleed Peach Dust panel with the
// photograph running to the edge of the page and an oversized headline, so it
// does not read as another centred ivory block. The product page keeps the
// shared EditorialFeature; copy is passed in, never invented here.
export default function HomeIconProduct({
  src,
  alt,
  kicker,
  headline,
  body,
  href,
  cta,
}: {
  src: string;
  alt: string;
  kicker: string;
  headline: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <>
      <section className="grid bg-ivory md:grid-cols-2">
        <div className="relative min-h-[26rem] md:min-h-[48rem]">
          <ResponsiveImage src={src} alt={alt} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-[50%_22%]" />
        </div>
        <Reveal className="flex flex-col justify-center px-[clamp(1.5rem,5vw,6rem)] py-16 md:py-24">
          <p className="text-[12px] uppercase tracking-[0.3em] text-ochre">{kicker}</p>
          <h2 className="mt-4 font-serif text-[clamp(2.25rem,1.2rem+3.2vw,4.5rem)] leading-[1.05] text-garden">
            {headline}
          </h2>
          <p className="mt-6 max-w-md text-[clamp(1rem,0.9rem+0.3vw,1.15rem)] leading-relaxed text-ink/80">{body}</p>
          <Link
            href={href}
            className="btn-press mt-10 inline-flex min-h-[48px] items-center self-start bg-garden px-8 py-3 text-[12px] uppercase tracking-[0.28em] text-ivory transition hover:bg-ochre"
          >
            {cta}
          </Link>
        </Reveal>
      </section>
    </>
  );
}
