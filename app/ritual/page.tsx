import Image from "next/image";
import Link from "next/link";
import { ritualProducts, products } from "@/lib/products";
import { productTint } from "@/lib/color";

export const metadata = { title: "The Ritual — CHIAREL™" };

export default function RitualPage() {
  const lip = products.find((p) => p.slug === "lip-concentrate")!;
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="eyebrow">The Ritual</p>
      <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-tight">
        Cleanse → Tone → Serum → Moisturize
      </h1>
      <p className="mt-4 max-w-xl text-sm text-ink/70">
        Four gestures, morning and evening. The skin responds to consistency —
        which is why the ritual is designed to be delivered, not repurchased.
      </p>
      <Link
        href="/assessment"
        className="mt-4 inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
      >
        Take the Skin Assessment™ to find your starting point
      </Link>

      <div className="mt-16 space-y-20">
        {ritualProducts.map((p, i) => (
          <section
            key={p.slug}
            className={`flex flex-col items-center gap-10 md:flex-row ${
              i % 2 ? "md:flex-row-reverse" : ""
            }`}
          >
            <div
              className="relative aspect-square w-full overflow-hidden rounded-sm md:w-1/2"
              style={{ backgroundColor: productTint(p.color.hex) }}
            >
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>
            <div className="w-full md:w-1/2">
              <p className="eyebrow">
                Step {p.ritualOrder} · {p.step}
              </p>
              <h2 className="mt-2 font-serif text-3xl">{p.name}</h2>
              <p className="text-sm text-ink/60">{p.descriptor}</p>
              <p className="mt-4 max-w-md text-sm text-ink/75">{p.blurb}</p>
              <p className="mt-3 text-[12px] text-ink/50">
                {p.complex} · {p.family}
              </p>
              <div className="mt-6 flex items-center gap-6">
                <Link
                  href={`/shop/${p.slug}`}
                  className="border border-ink px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] transition hover:border-ochre hover:text-ochre"
                >
                  ${p.price.subscription} — Subscribe
                </Link>
                <span className="text-[12px] text-ink/50">
                  ${p.price.oneTime} one-time
                </span>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-24 border-t border-ink/10 pt-14">
        <p className="eyebrow">Beyond the Ritual</p>
        <div className="mt-6 flex flex-col items-center gap-10 md:flex-row">
          <div
            className="relative aspect-square w-full overflow-hidden rounded-sm md:w-1/3"
            style={{ backgroundColor: productTint(lip.color.hex) }}
          >
            <Image src={lip.image} alt={lip.name} fill sizes="33vw" className="object-cover" />
          </div>
          <div>
            <h2 className="font-serif text-2xl">{lip.name}</h2>
            <p className="text-sm text-ink/60">{lip.descriptor}</p>
            <Link
              href={`/shop/${lip.slug}`}
              className="mt-4 inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.2em] text-ochre"
            >
              Discover
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
