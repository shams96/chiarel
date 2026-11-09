import Link from "next/link";
import Container from "@/components/layout/Container";

// Shop Phase 1: a quick-links strip for returning customers, every link an
// existing page. Delivery and returns promises are deliberately not worded
// here (they wait for owner-approved text, Phase 2).
const LINKS = [
  { href: "/account", label: "Your account & orders" },
  { href: "/contact", label: "Contact the House" },
  { href: "/terms", label: "Shipping & returns" },
  { href: "/#faq", label: "Questions answered" },
];

export default function ShopServiceStrip() {
  return (
    <nav aria-label="Help and orders" className="border-t border-ink/15">
      <Container>
        <ul className="flex flex-wrap gap-x-10 gap-y-1 py-6">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="flex min-h-[44px] items-center text-eyebrow uppercase text-ink hover:text-ochre"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  );
}
