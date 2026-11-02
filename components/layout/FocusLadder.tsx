// The Focus Ladder: one word at falling sizes, from a hairline outline to a
// solid letter, so the eye reads it as coming into focus. Decorative: the
// whole block is aria-hidden and the words exist as real text beside it (the
// page's h1). Sizes and fills live in globals.css (.ladder).
export default function FocusLadder({
  word = "Clarity",
  className = "",
}: {
  word?: string;
  className?: string;
}) {
  return (
    <div className={`ladder-wrap ${className}`} aria-hidden="true">
      <p className="ladder font-serif">
        <span>{word}</span>
        <span>{word}</span>
        <span>{word}</span>
        <span>{word}</span>
        <span>{word}</span>
        <span>{word}™</span>
      </p>
    </div>
  );
}
