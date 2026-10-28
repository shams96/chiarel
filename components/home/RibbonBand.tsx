// A strip of the printed CHIAREL velvet ribbon (the same artwork as the 1/2 inch
// ribbon), used as a full-width divider between Home sections. Decorative only.
// Green sits on Red Ochre and Peach Dust, Red Ochre sits on Formal Garden.
const FILES = { green: "ribbon-green.png", redochre: "ribbon-redochre.png" } as const;
const FALLBACK = { green: "#1F5129", redochre: "#913832" } as const;

export default function RibbonBand({ tone = "green" }: { tone?: keyof typeof FILES }) {
  return (
    <div
      aria-hidden="true"
      className="h-[clamp(22px,2.4vw,46px)] w-full bg-repeat-x"
      style={{
        backgroundColor: FALLBACK[tone],
        backgroundImage: `url(/assets/brand/${FILES[tone]})`,
        backgroundSize: "auto 100%",
      }}
    />
  );
}
