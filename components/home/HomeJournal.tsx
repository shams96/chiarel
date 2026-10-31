import Link from "next/link";
import Section from "@/components/layout/Section";
import Grid from "@/components/layout/Grid";
import Eyebrow from "@/components/layout/Eyebrow";
import Heading from "@/components/layout/Heading";
import { journalEntries } from "@/lib/journal-entries";

// Section 11, Journal: the four existing articles as a ruled editorial list.
export default function HomeJournal() {
  return (
    <Section id="journal" rule labelledBy="journal-heading">
      <Grid className="gap-y-10">
        <div className="col-span-4 md:col-span-3 lg:col-span-3">
          <Eyebrow className="text-ochre">Journal</Eyebrow>
          <Heading level="h3" as="h2" id="journal-heading" className="mt-4">
            Notes from the House
          </Heading>
          <Link
            href="/journal"
            className="mt-6 flex min-h-[44px] items-center text-eyebrow uppercase text-ochre hover:text-ink"
          >
            All articles →
          </Link>
        </div>
        <ul className="col-span-4 divide-y divide-ink/15 border-y border-ink/15 md:col-span-5 lg:col-span-8 lg:col-start-5">
          {journalEntries.map((e) => (
            <li key={e.slug}>
              <Link href={`/journal/${e.slug}`} className="group block py-6 md:py-7">
                <p className="text-eyebrow uppercase text-ink/70">{e.tag}</p>
                <h3 className="mt-2 font-serif text-h4 text-ink group-hover:text-ochre md:text-h3">
                  {e.title}
                </h3>
                <p className="mt-2 max-w-measure text-caption text-ink/75">
                  {e.excerpt}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Grid>
    </Section>
  );
}
