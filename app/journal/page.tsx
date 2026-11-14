import Link from "next/link";
import EmailSignup from "@/components/EmailSignup";
import { journalEntries as entries } from "@/lib/journal-entries";
import PageHead from "@/components/layout/PageHead";
import Container from "@/components/layout/Container";

export const metadata = {
  title: "Journal",
  description:
    "Notes from the House of Clarity™: the ritual, the label and the town of Isola del Liri.",
  alternates: { canonical: "/journal" },
};


export default function JournalPage() {
  // EmailSignup renders nothing unless the flag is on; only reserve the left band when it will show.
  const signupOn = process.env.NEXT_PUBLIC_EMAIL_SIGNUP === "on";
  return (
    <>
      <PageHead lines={["Notes from", "the House"]} />
      <Container className="pb-section">
      <div className="grid-12">
      <div className={`col-span-full lg:col-span-8 lg:row-start-1 ${signupOn ? "lg:col-start-5" : "lg:col-start-3"}`}>
      <div className="divide-y divide-ink/10">
        {entries.map((e) => (
          <article key={e.slug} className="py-8">
            <p className="text-eyebrow uppercase text-ochre">
              {e.tag}
            </p>
            <Link href={`/journal/${e.slug}`}>
              <h2 className="mt-1 font-serif text-h4 text-ochre underline decoration-ochre/0 underline-offset-4 transition hover:decoration-ochre">
                {e.title}
              </h2>
            </Link>
            <p className="mt-2 max-w-[60ch] text-base text-ink md:text-[1.0625rem]">{e.excerpt}</p>
            <Link
              href={`/journal/${e.slug}`}
              className="mt-3 inline-block border-b border-ochre pb-0.5 text-eyebrow uppercase text-ochre"
            >
              Read the Article
            </Link>
          </article>
        ))}
      </div>
      </div>

      {/* Left band: the signup stays in view beside the list at lg. */}
      {signupOn && (
      <div className="col-span-full mt-6 border-t border-ink/10 pt-12 lg:sticky lg:top-24 lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:self-start lg:border-t-0 lg:pt-0">
        <EmailSignup source="journal" />
      </div>
      )}
      </div>
      </Container>
    </>
  );
}
