import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-ivory px-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-ochre">
        CHIAREL™
      </p>
      <h1 className="mt-6 font-serif text-3xl text-ink">Page not found</h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/60">
        The page you&rsquo;re looking for doesn&rsquo;t exist, or may have moved.
      </p>
      <div className="mt-8 flex items-center gap-6">
        <Link
          href="/shop"
          className="btn-press bg-ink px-8 py-3 text-[12px] uppercase tracking-[0.25em] text-ivory transition hover:bg-ochre"
        >
          Shop the House
        </Link>
        <Link
          href="/"
          className="border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
