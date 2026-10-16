import { redundantComponents } from "@/lib/cart-math";

/** Non-blocking note when a product in the bag is already part of a set in the bag. Nothing is removed. */
export default function CartIncludedNote({ lines }: { lines: { slug: string }[] }) {
  const items = redundantComponents(lines);
  if (items.length === 0) return null;
  return (
    <ul className="mb-4 space-y-1 text-[12px] text-ink/70" role="status">
      {items.map((i) => (
        <li key={i.slug}>
          {i.name} is already included in {i.setName}.
        </li>
      ))}
    </ul>
  );
}
