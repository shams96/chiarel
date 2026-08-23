export const SITE_URL = "https://chiarel.com";
export const SITE_NAME = "CHIAREL™";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CHIAREL",
  legalName: "1HubSolutions, LLC",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/brand/CHIAREL_Favicon_Monogram.svg`,
  description:
    "CHIAREL™ — House of Skin Intelligence™. Advancing Cellular Clarity™. Formulated in Isola del Liri, Italy, with Natural You Srl.",
  slogan: "House of Skin Intelligence™",
  foundingLocation: {
    "@type": "Place",
    name: "Isola del Liri, Italy",
  },
};

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function productJsonLd(p: {
  name: string;
  descriptor: string;
  blurb: string;
  image: string;
  slug: string;
  price: { oneTime: number };
  color: { name: string };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.blurb,
    image: `${SITE_URL}${p.image}`,
    brand: { "@type": "Brand", name: "CHIAREL" },
    color: p.color.name,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/shop/${p.slug}`,
      priceCurrency: "USD",
      price: p.price.oneTime,
      availability: "https://schema.org/InStock",
    },
  };
}
