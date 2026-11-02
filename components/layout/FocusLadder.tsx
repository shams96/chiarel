// The Focus Ladder: one word at falling sizes, from a hairline outline to a
// solid letter, so the eye reads it as coming into focus. Decorative: the
// words are drawn with CSS content from data-w, so they are not text nodes at
// all (nothing for crawlers, reader mode or contrast checkers to read), and the
// block is aria-hidden; the real words are the page's h1. Sizes and fills live
// in globals.css (.ladder).
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
        <span data-w={word} />
        <span data-w={word} />
        <span data-w={word} />
        <span data-w={word} />
        <span data-w={word} />
        <span data-w={`${word}™`} />
      </p>
    </div>
  );
}
