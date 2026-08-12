import Link from "next/link";

export const metadata = { title: "Journal" };

const entries = [
  {
    slug: "chiarel-ritual-guide",
    title: "How to Use the CHIAREL Daily Ritual",
    tag: "The Ritual",
    excerpt:
      "The complete guide — morning and evening order, why Terra Radiance Crème and Recovery Masque feel different by design, and how to apply each for best results.",
  },
  {
    slug: "three-skins-one-house",
    title: "Three Skins, One House: The CHIAREL Origin Story",
    tag: "The House",
    excerpt:
      "Why CHIAREL exists: a household with three biologically distinct skin profiles, and no formulation house precise enough to serve all three.",
  },
  {
    slug: "isola-del-liri-waterfall",
    title: "A Town Built Around a Waterfall",
    tag: "The House",
    excerpt:
      "Isola del Liri, the Cascata Grande, and why provenance matters to a formulation.",
  },
  {
    slug: "reading-a-label",
    title: "Reading a Label Like the House Does",
    tag: "The Science",
    excerpt:
      "Outcome language over promise language — how CHIAREL™ chooses its words, and the words it retires.",
  },
];

export default function JournalPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="eyebrow">Journal</p>
      <h1 className="mt-2 font-serif text-4xl">Notes from the House</h1>
      <div className="mt-10 divide-y divide-ink/10">
        {entries.map((e) => (
          <article key={e.slug} className="py-8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-ochre">
              {e.tag}
            </p>
            <Link href={`/journal/${e.slug}`}>
              <h2 className="mt-1 font-serif text-2xl hover:text-ochre">
                {e.title}
              </h2>
            </Link>
            <p className="mt-2 max-w-xl text-sm text-ink/70">{e.excerpt}</p>
            <Link
              href={`/journal/${e.slug}`}
              className="mt-3 inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
            >
              Read the Article
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
