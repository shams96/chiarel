export const SITE_URL = "https://chiarel.com";
export const SITE_NAME = "CHIAREL™";

// General inquiries — follows the same @chiarel.com convention already used
// for press@chiarel.com in app/press/page.tsx. Make sure this inbox is
// actually set up to receive mail (forwarding or a real mailbox) before relying on it.
export const CONTACT_EMAIL = "hello@chiarel.com";
export const ORDERS_EMAIL = "orders@chiarel.com";
export const PRESS_EMAIL = "press@chiarel.com";

// Bump this when homepage content materially changes — feeds dateModified
// in webPageJsonLd and the visible "content last reviewed" line, both of
// which are freshness signals AI systems weight for citation.
export const HOMEPAGE_LAST_UPDATED = "2026-08-23";
// The site's actual launch date (first substantive build commit) — used as
// datePublished, distinct from the dateModified value above.
export const HOMEPAGE_PUBLISHED = "2026-08-07";

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
  contactPoint: {
    "@type": "ContactPoint",
    email: CONTACT_EMAIL,
    contactType: "customer service",
  },
};

export const formulatorJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Grazia Savoriti",
  jobTitle: "Pharmacist · Cosmetic & Nutraceutical Research",
  worksFor: { "@type": "Organization", name: "CHIAREL" },
  url: `${SITE_URL}/house`,
};

export function webPageJsonLd(opts: {
  url: string;
  name: string;
  description: string;
  dateModified?: string;
  datePublished?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: opts.url,
    name: opts.name,
    description: opts.description,
    datePublished: opts.datePublished ?? HOMEPAGE_PUBLISHED,
    dateModified: opts.dateModified ?? HOMEPAGE_LAST_UPDATED,
    author: {
      "@type": "Person",
      name: "Grazia Savoriti",
      url: `${SITE_URL}/house`,
      jobTitle: "Pharmacist · Cosmetic & Nutraceutical Research",
    },
    publisher: { "@type": "Organization", name: "CHIAREL" },
  };
}

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

export function offerCatalogJsonLd(
  products: {
    slug: string;
    name: string;
    price: { oneTime: number };
  }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "CHIAREL Products",
    itemListElement: products.map((p) => ({
      "@type": "Offer",
      name: p.name,
      url: `${SITE_URL}/shop/${p.slug}`,
      priceCurrency: "USD",
      price: p.price.oneTime,
      availability: "https://schema.org/InStock",
      areaServed: "US",
      seller: { "@type": "Organization", name: "CHIAREL", url: SITE_URL },
      itemOffered: { "@type": "Product", name: p.name },
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
