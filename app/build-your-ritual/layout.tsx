import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Your Ritual",
  description:
    "Choose exactly the CHIAREL™ steps your skin needs — cleanse, tone, serum, and moisturize, priced and delivered individually.",
  alternates: { canonical: "/build-your-ritual" },
};

export default function BuildYourRitualLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
