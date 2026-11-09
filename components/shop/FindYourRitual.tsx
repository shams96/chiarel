import Link from "next/link";
import ResponsiveImage from "@/components/ResponsiveImage";
import Section from "@/components/layout/Section";
import Grid from "@/components/layout/Grid";
import Eyebrow from "@/components/layout/Eyebrow";
import Heading from "@/components/layout/Heading";

// Shop Phase 1 (claudedocs/specs/store-enhancement): the two guided paths that
// already exist (/assessment, /build-your-ritual) surfaced above the product
// grids. Links and plain descriptions only; no new claims, prices or offers.
const PATHS = [
  {
    href: "/assessment",
    title: "Take the skin assessment",
    body: "A short set of questions, then a suggested place to start.",
  },
  {
    href: "/build-your-ritual",
    title: "Build your ritual",
    body: "Choose exactly the steps you want from the five-product ritual.",
  },
];

export default function FindYourRitual() {
  return (
    <Section id="find-your-ritual" labelledBy="find-your-ritual-heading" className="!pb-0">
      <Grid className="items-center gap-y-8">
        <figure className="col-span-4 md:col-span-4 lg:col-span-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-md bg-cloud">
            <ResponsiveImage
              src="/assets/shop/clarity-ritual-model.jpg"
              alt="A woman resting her cheek on her hand behind the five Clarity products: Essence, Day Crème, Night Crème, Neck & Décolleté Crème and Eye Contour Concentrate."
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-2 text-caption text-ink">Image generated with AI.</figcaption>
        </figure>
        <div className="col-span-4 md:col-span-4 lg:col-span-5 lg:col-start-8">
          <Eyebrow className="text-ochre">Begin</Eyebrow>
          <Heading level="h2" id="find-your-ritual-heading" className="mt-4 text-ochre">
            Find Your Ritual
          </Heading>
          <p className="mt-4 max-w-measure text-body text-ink">
            Not sure where to start? Choose a path.
          </p>
        <ul className="mt-8 divide-y divide-ink/15 border-y border-ink/15">
          {PATHS.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="group flex min-h-[44px] items-center justify-between gap-6 py-6">
                <span>
                  <span className="block font-serif text-h4 text-ochre">{p.title}</span>
                  <span className="mt-2 block max-w-measure text-caption text-ink">{p.body}</span>
                </span>
                <span aria-hidden="true" className="text-xl text-ink transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        </div>
      </Grid>
    </Section>
  );
}
