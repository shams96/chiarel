import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const ok = status === "ok";
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-4xl leading-tight">
        {ok ? "You are unsubscribed" : "That link did not work"}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/70">
        {ok
          ? "You will not receive further email from the CHIAREL list."
          : "The unsubscribe link is invalid or incomplete. Write to us from the Contact page and we will remove you."}
      </p>
      <Link
        href="/contact"
        className="mt-8 inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
      >
        Contact
      </Link>
    </div>
  );
}
