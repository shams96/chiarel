import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/lib/cart-context";
import { SITE_URL, SITE_NAME, organizationJsonLd } from "@/lib/seo";

// Next's default static-page cache header (s-maxage=31536000, one year) is
// safe on Vercel because deploys auto-purge that cache. On Hostinger's CDN
// (hcdn) there is no deploy-triggered purge, so a year-long cache turns
// every future deploy invisible until someone manually flushes the CDN.
// Revalidating hourly bounds the damage without losing CDN caching entirely.
export const revalidate = 3600;

// Self-hosted instead of next/font/google: that loader fetches font files
// from fonts.googleapis.com DURING the production build, which crashes
// ("Cannot read properties of null (reading '1')") on any host whose build
// container can't reach Google's servers — confirmed on Hostinger's build
// environment. Files downloaded once from the same Google Fonts CDN
// (fonts.gstatic.com) that next/font/google would have fetched at build
// time; both Libre Bodoni and Jost are variable fonts, so one physical file
// per subset serves every declared weight via the font's own weight axis —
// mirrors exactly what Google's own generated CSS does.
const serif = localFont({
  src: [
    { path: "../public/fonts/libre-bodoni-latin.woff2", weight: "400 600", style: "normal" },
    { path: "../public/fonts/libre-bodoni-latin-ext.woff2", weight: "400 600", style: "normal" },
  ],
  variable: "--font-serif",
});
const sans = localFont({
  src: [
    { path: "../public/fonts/jost-latin.woff2", weight: "300 500", style: "normal" },
    { path: "../public/fonts/jost-latin-ext.woff2", weight: "300 500", style: "normal" },
  ],
  variable: "--font-sans",
});

const description =
  "CHIAREL™ · The House of Clarity™ · Advancing Cellular Clarity™. Intelligent formulations crafted in Isola del Liri, Italy.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — The House of Clarity™`,
    template: `%s — ${SITE_NAME}`,
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — The House of Clarity™`,
    description,
    url: SITE_URL,
    images: [{ url: "/assets/editorial/hero-shore-duo.png", width: 1536, height: 934 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — The House of Clarity™`,
    description,
    images: ["/assets/editorial/hero-shore-duo.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${serif.variable} ${sans.variable}`}>
        <CartProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
