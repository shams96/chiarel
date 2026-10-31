import Reveal from "@/components/Reveal";
import Section from "@/components/layout/Section";
import Grid from "@/components/layout/Grid";
import Eyebrow from "@/components/layout/Eyebrow";
import Heading from "@/components/layout/Heading";

// Section 07, Clinical Observations: a deliberate, visible placeholder.
// The structure is final (what a reader needs to judge testing: who, how long,
// what was seen, and the limits), but no figures or findings exist in the
// project yet, so every field says it is pending. Grazia Savoriti will provide
// the content; replace the PENDING values with her approved wording and nothing
// else here needs to change. Do not add numbers, percentages or outcomes that
// she has not supplied.
const PENDING = "To be published";

const FIELDS = [
  { label: "Participants", note: "How many people took part." },
  { label: "Duration", note: "How long the testing ran." },
  { label: "Observed outcomes", note: "What was observed, in plain terms." },
  { label: "Limitations", note: "What this testing cannot show." },
];

export default function HomeObservations() {
  return (
    <Section id="observations" rule labelledBy="observations-heading">
      <Grid className="gap-y-10">
        <Reveal className="col-span-4 md:col-span-3 lg:col-span-3">
          <Eyebrow className="text-ochre">Clinical Observations</Eyebrow>
          <Heading level="h3" as="h2" id="observations-heading" className="mt-4">
            Testing, stated plainly
          </Heading>
        </Reveal>
        <Reveal
          delay={0.08}
          className="col-span-4 md:col-span-5 lg:col-span-8 lg:col-start-5"
        >
          <p className="max-w-measure text-body text-ink/80">
            Information about CHIAREL&rsquo;s testing will be published here
            once it has been reviewed.
          </p>
          <dl className="mt-8 grid grid-cols-1 border-y border-ink/15 sm:grid-cols-2">
            {FIELDS.map((f, i) => (
              <div
                key={f.label}
                className={`py-5 sm:px-0 ${i % 2 === 1 ? "sm:border-l sm:border-ink/15 sm:pl-6" : "sm:pr-6"} ${i > 1 ? "border-t border-ink/15" : ""} ${i === 1 ? "border-t border-ink/15 sm:border-t-0" : ""}`}
              >
                <dt className="text-eyebrow uppercase text-ink/70">{f.label}</dt>
                <dd className="mt-2 font-serif text-h4 text-ink/60">{PENDING}</dd>
                <dd className="mt-1 text-caption text-ink/65">{f.note}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Grid>
    </Section>
  );
}
