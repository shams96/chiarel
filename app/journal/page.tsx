import Link from "next/link";
import EmailSignup from "@/components/EmailSignup";
import { journalEntries as entries } from "@/lib/journal-entries";

export const metadata = { title: "Journal", alternates: { canonical: "/journal" } };


export default function JournalPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-serif text-4xl">Notes from the House</h1>
      <div className="mt-10 divide-y divide-ink/10">
        {entries.map((e) => (
          <article key={e.slug} className="py-8">
            <p className="text-[12px] uppercase tracking-[0.2em] text-ochre">
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
      <div className="mt-6 border-t border-ink/10 pt-12">
        <EmailSignup source="journal" />
      </div>
    </div>
  );
}
