// One quiet line under a product's descriptor, only where it is fully accurate.
// "Oil-free formula" is a statement about composition: the Essence's v4 INCI
// list (CHIAREL_Launch_Formulas_v4, Oct 30 2026) has no oil, butter, ester or
// fatty-alcohol line. The creams and the eye concentrate are not oil-free
// (squalane, jojoba, shea, triglycerides), and "non-greasy" is a feel claim
// with no test evidence, so none of them gets a line. tests/v4-copy-accuracy
// fails if an "Oil-free" note is given to a product whose list has oil-like lines.
const NOTES: Record<string, string> = {
  "chiarel-essence": "Oil-free formula",
};

export function quietNote(slug: string): string | undefined {
  return NOTES[slug];
}
