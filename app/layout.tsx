import type { Metadata } from "next";
import { Libre_Bodoni, Jost } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/lib/cart-context";
import { SITE_URL, SITE_NAME, organizationJsonLd } from "@/lib/seo";

const serif = Libre_Bodoni({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
});
const sans = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
});

const description =
  "CHIAREL™ · House of Skin Intelligence™ · Advancing Cellular Clarity™. Intelligent formulations crafted in Isola del Liri, Italy.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — House of Skin Intelligence™`,
    template: `%s — ${SITE_NAME}`,
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — House of Skin Intelligence™`,
    description,
    url: SITE_URL,
    images: [{ url: "/assets/editorial/hero-night.png", width: 1264, height: 842 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — House of Skin Intelligence™`,
    description,
    images: ["/assets/editorial/hero-night.png"],
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
