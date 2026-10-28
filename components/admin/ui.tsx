// Shared look for the admin console: CHIAREL brand tokens (Formal Garden, Red
// Ochre, Peach Dust, Champagne, Ivory, Ink; Libre Bodoni headings, Jost body)
// as small components, so every admin page is built from the same kit.
// Flat colours only, champagne hairlines, no gradients. Contrast checked:
// ivory on garden 8.6, ivory on redochre 6.9, ink on champagne 10.2, ink on
// peachdust 12.7. The API is the security boundary; this file is styling only.
import Image from "next/image";
import Link from "next/link";
import type { ReactNode, ButtonHTMLAttributes } from "react";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/** Page container: wide, centred, generous gutters. */
export function PageShell({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  return (
    <div className={cx("mx-auto w-full px-[clamp(1rem,3vw,3rem)] py-8 md:py-12", narrow ? "max-w-xl" : "max-w-[84rem]")}>
      {children}
    </div>
  );
}

/** Title block: small Red Ochre eyebrow, serif title, soft subtitle, actions on the right. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-champagne pb-6">
      <div className="max-w-3xl">
        {eyebrow && <p className="text-[11px] uppercase tracking-[0.34em] text-redochre">{eyebrow}</p>}
        <h1 className="mt-2 font-serif text-[clamp(1.9rem,1.2rem+2vw,3rem)] leading-tight text-garden">{title}</h1>
        {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-ink/75">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

const TONES = {
  ivory: "bg-ivory text-ink border border-champagne",
  white: "bg-white text-ink border border-champagne/70",
  peach: "bg-peachdust text-ink",
  garden: "bg-garden text-ivory",
  redochre: "bg-redochre text-ivory",
  champagne: "bg-champagne text-ink",
} as const;
export type Tone = keyof typeof TONES;

export function Card({ children, tone = "white", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <section className={cx(TONES[tone], "p-5 md:p-7", className)}>{children}</section>;
}

/** Section heading inside a page. */
export function SectionTitle({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-4 mt-10 flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="font-serif text-[clamp(1.2rem,1rem+0.8vw,1.7rem)] text-garden">{children}</h2>
      {hint && <p className="text-[13px] text-ink/70">{hint}</p>}
    </div>
  );
}

/** A number with a label. Tinted tones read as festive highlights. */
export function Stat({
  label,
  value,
  sub,
  href,
  tone = "white",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  href?: string;
  tone?: Tone;
}) {
  const dark = tone === "garden" || tone === "redochre";
  const body = (
    <>
      <p className={cx("text-[11px] uppercase tracking-[0.28em]", dark ? "text-ivory/85" : "text-ink/70")}>{label}</p>
      <p className="mt-3 font-serif text-[clamp(1.9rem,1.3rem+1.6vw,3rem)] leading-none tabular-nums">{value}</p>
      {sub && <p className={cx("mt-3 text-[13px] leading-snug", dark ? "text-ivory/90" : "text-ink/75")}>{sub}</p>}
    </>
  );
  const cls = cx(TONES[tone], "block p-5 md:p-6 transition-transform duration-300 ease-out", href && "hover:-translate-y-0.5");
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,13.5rem),1fr))]">{children}</div>;
}

const BTN = {
  primary: "bg-garden text-ivory hover:bg-garden/90 border border-garden",
  secondary: "bg-transparent text-garden border border-garden hover:bg-garden/10",
  champagne: "bg-champagne text-ink border border-champagne hover:bg-champagne/80",
  danger: "bg-redochre text-ivory border border-redochre hover:bg-redochre/90",
  ghost: "bg-transparent text-redochre border border-transparent underline underline-offset-4 hover:bg-redochre/10",
} as const;
export type ButtonVariant = keyof typeof BTN;

const btnClass = (variant: ButtonVariant, small?: boolean) =>
  cx(
    "btn-press inline-flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.24em] transition disabled:cursor-wait disabled:opacity-60",
    small ? "px-3.5 py-2" : "px-6 py-3",
    BTN[variant]
  );

export function Button({
  variant = "primary",
  small,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; small?: boolean }) {
  return <button type="button" {...rest} className={cx(btnClass(variant, small), className)} />;
}

export function LinkButton({
  href,
  variant = "secondary",
  small,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  small?: boolean;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={btnClass(variant, small)}>
      {children}
    </Link>
  );
}

/** Form control classes (apply to input, select, textarea). */
export const inputClass =
  "block w-full border border-champagne bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-ink/45 focus:border-garden focus:outline-none focus:ring-1 focus:ring-garden";

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cx("block text-[11px] uppercase tracking-[0.24em] text-ink/75", className)}>
      {label}
      <span className="mt-1.5 block normal-case tracking-normal">{children}</span>
    </label>
  );
}

/** Responsive table: scrolls sideways on small screens, quiet zebra rows. */
export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-champagne bg-white">
      <table className="w-full border-collapse text-left text-[14px]">
        <thead>
          <tr className="border-b border-champagne bg-peachdust/60">
            {head.map((h, i) => (
              <th key={i} className="whitespace-nowrap px-4 py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-garden">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:nth-child(even)]:bg-peachdust/25 [&>tr]:border-b [&>tr]:border-champagne/40">{children}</tbody>
      </table>
    </div>
  );
}
export const tdClass = "px-4 py-3 align-top";

const BADGE = {
  ok: "bg-garden text-ivory",
  warn: "bg-champagne text-ink",
  danger: "bg-redochre text-ivory",
  muted: "bg-ink/10 text-ink",
} as const;
export function Badge({ tone = "muted", children }: { tone?: keyof typeof BADGE; children: ReactNode }) {
  return (
    <span className={cx("inline-block whitespace-nowrap px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]", BADGE[tone])}>{children}</span>
  );
}

const ALERT = {
  error: "border-redochre bg-redochre/10 text-redochre",
  success: "border-garden bg-garden/10 text-garden",
  info: "border-champagne bg-champagne/30 text-ink",
} as const;
export function Alert({ kind = "info", children }: { kind?: keyof typeof ALERT; children: ReactNode }) {
  return (
    <p role={kind === "error" ? "alert" : "status"} className={cx("mb-5 border-l-4 px-4 py-3 text-[14px]", ALERT[kind])}>
      {children}
    </p>
  );
}

/** Friendly empty state with a packshot, instead of a bare "No results". */
export function EmptyState({ title, text, image = "/assets/products/clarity-essence-bottle.png" }: { title: string; text?: string; image?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 border border-dashed border-champagne bg-peachdust/30 px-6 py-12 text-center">
      <Image src={image} alt="" width={120} height={120} className="h-24 w-24 object-contain" />
      <p className="font-serif text-xl text-garden">{title}</p>
      {text && <p className="max-w-md text-[14px] text-ink/75">{text}</p>}
    </div>
  );
}

export function Loading({ children = "Loading…" }: { children?: ReactNode }) {
  return <p className="py-8 text-[14px] text-ink/70">{children}</p>;
}

/** Status words to badge tones, shared by orders, disputes and subscribers. */
export function statusTone(status: string): keyof typeof BADGE {
  switch (status) {
    case "paid":
    case "shipped":
    case "delivered":
    case "active":
    case "won":
      return "ok";
    case "pending":
    case "packed":
    case "unfulfilled":
    case "needs_response":
    case "under_review":
      return "warn";
    case "cancelled":
    case "unsubscribed":
    case "lost":
      return "danger";
    default:
      return "muted";
  }
}
