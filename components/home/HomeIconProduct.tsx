import ResponsiveImage from "@/components/ResponsiveImage";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/layout/SectionHeading";

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
      <section className="bg-cloud">
        <Container>
          <div className="grid items-center md:grid-cols-2 md:gap-x-[clamp(2rem,5vw,6rem)]">
            <div className="flex items-center justify-center py-12 md:py-24">
              <div className="relative aspect-[2/3] w-full max-w-[30rem] overflow-hidden">
                <ResponsiveImage src={src} alt={alt} sizes="(max-width: 768px) 90vw, 480px" className="object-cover" />
              </div>
            </div>
            <Reveal className="flex flex-col justify-center pb-16 md:py-24">
              <p className="text-eyebrow uppercase tracking-[0.3em] text-ochre">{kicker}</p>
              <SectionHeading className="mt-4" lead={body}>
                {headline}
              </SectionHeading>
              <Link
                href={href}
                className="btn-press mt-10 inline-flex min-h-[48px] items-center self-start bg-garden px-8 py-3 text-eyebrow uppercase tracking-[0.28em] text-ivory transition hover:bg-ochre"
              >
                {cta}
              </Link>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
