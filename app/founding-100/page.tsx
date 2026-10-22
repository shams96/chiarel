import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ComingSoonPackshot from "@/components/ComingSoonPackshot";
import { getProductOrThrow } from "@/lib/products";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "The Founding Members",
  description:
    "One hundred numbered places in the CHIAREL 90-Day Ritual, with early access to every new formula.",
  alternates: { canonical: "/founding-100" },
  openGraph: {
    title: "The Founding Members — CHIAREL",
    description:
      "One hundred numbered places in the CHIAREL 90-Day Ritual, with early access to every new formula.",
    url: "/founding-100",
    images: [{ url: "/assets/editorial/og-n1-hands.jpg", width: 1200, height: 630 }],
  },
};

export const dynamic = "force-dynamic";

export default async function Founding100Page() {
  const masque = getProductOrThrow("recovery-masque");
  const claimed = await db.foundingSignup.count();
  const remaining = Math.max(0, 100 - claimed);
  const full = remaining === 0;

  return (
    <div>
      {/* Hero — image-led gateway moment. The capture card is the page's
          entire job, so it gets the visual weight; the programme mechanics
          and legal terms live below, for whoever scrolls to them. */}
      <section className="relative overflow-hidden bg-ink text-ivory">
        <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-2">
          <div className="relative aspect-[4/5] w-full lg:aspect-auto">
            <Image
              src={masque.image}
              alt={masque.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 md:px-12 lg:py-20">
            <p className="text-[11px] uppercase tracking-[0.4em] text-champagne">
              By invitation · The House Opens
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-[0.98] tracking-[-0.01em] md:text-6xl">
              The Founding Members
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ivory/75">
              One hundred places, each one numbered. We are opening the House
              to its first hundred members, and they will meet every new
              formula before anyone else.
            </p>

            {/* Real scarcity, not decoration — this number is the actual
                count of saved signups, not a fabricated countdown. */}
            <div className="mt-8 flex items-baseline gap-3">
              <span className="tabular-nums font-serif text-4xl text-champagne">
                {remaining}
              </span>
              <span className="text-[12px] uppercase leading-tight tracking-[0.14em] text-ivory/60">
                {full ? (
                  <>places left on the list
                  <br />
                  the Founding Members are complete</>
                ) : (
                  <>of 100 places left on the list<br />no more once they&rsquo;re taken</>
                )}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 border-t border-ivory/10 pt-5 text-[12px] text-ivory/55">
              <span>Formulated by Grazia Savoriti, Pharmacist</span>
              <span>Built around L-Ornithine and Panthenol</span>
            </div>

            <div className="mt-8">
              {full ? (
                <p className="card-elevated rounded-md bg-white/5 p-6 text-sm leading-relaxed text-ivory/80">
                  The Founding Members are complete.{" "}
                  <Link href="/shop/recovery-masque" className="border-b border-champagne text-champagne">
                    Begin the 90-Day Ritual
                  </Link>{" "}
                  at its published price.
                </p>
              ) : (
                <ComingSoonPackshot source={`${masque.name} — Founding Members`} />
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-16">
      <section className="space-y-10">
        <div className="border-l-2 border-ochre pl-6">
          <h2 className="font-serif text-2xl">How it works</h2>
          <ol className="mt-3 max-w-xl space-y-3 text-sm leading-relaxed text-ink/75">
            <li>
              <strong className="text-ink">1. Join.</strong> Choose your ritual
              at its published price. The 90-day plan, paid once,
              arrives in a single package.
            </li>
            <li>
              <strong className="text-ink">2. Receive.</strong> Your member
              number, from 001 to 100, and a place on the early-access list.
            </li>
            <li>
              <strong className="text-ink">3. Meet each launch first.</strong>{" "}
              Members hear about every new CHIAREL formula 48 hours before
              everyone else.
            </li>
            <li>
              <strong className="text-ink">4. Tell us the truth.</strong> If
              you choose to share your experience, we ask only for an honest
              account. A positive one is never required, and nothing is paid,
              refunded or credited in return.
            </li>
          </ol>
        </div>

        <div className="border-l-2 border-ink/20 pl-6">
          <h2 className="font-serif text-2xl">Terms</h2>
          <ul className="mt-3 max-w-xl list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-ink/60">
            <li>
              <strong className="text-ink/80">Founding Members.</strong> Limited
              to the first 100 qualifying orders. A qualifying order is one
              90-day plan purchase of an enrolled product at its
              published price. Limit one enrolment per household. The benefits
              are those listed on this page; CHIAREL may change them for future
              members without affecting existing members.
            </li>
            <li>
              <strong className="text-ink/80">No payment for content.</strong>{" "}
              Members are never required to submit content and receive nothing
              in exchange for it. Anything a member chooses to share must be an
              honest account of their experience.
            </li>
            <li>
              <strong className="text-ink/80">Content rights.</strong> For
              content a member voluntarily submits, the member grants CHIAREL
              (a division of 1HubSolutions, LLC) a non-exclusive, worldwide
              licence to display it on CHIAREL&rsquo;s channels with the
              member&rsquo;s permission for each use. The member keeps
              ownership.
            </li>
            <li>
              The 90-day supply ships in one package. Founding Members is a
              provisional name pending trademark clearance.
            </li>
          </ul>
        </div>
      </section>

      <div className="mt-14 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/shop/recovery-masque" className="border-b border-ochre pb-0.5 text-ochre">
          Begin the 90-Day Ritual
        </Link>
        <Link href="/science" className="border-b border-ink/30 pb-0.5 text-ink/60">
          The Science
        </Link>
      </div>
      </div>
    </div>
  );
}
