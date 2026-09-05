export const SITE_URL = "https://chiarel.com";
export const SITE_NAME = "CHIAREL™";

// General inquiries — follows the same @chiarel.com convention already used
// for press@chiarel.com in app/press/page.tsx. Make sure this inbox is
// actually set up to receive mail (forwarding or a real mailbox) before relying on it.
export const CONTACT_EMAIL = "hello@chiarel.com";
export const ORDERS_EMAIL = "orders@chiarel.com";
export const PRESS_EMAIL = "press@chiarel.com";

// Grazia Savoriti's independent, third-party bio — published by Natural You
// Srl (CHIAREL's manufacturing partner) on their own site, not CHIAREL's.
// This is the external verifying link for author/formulator attribution.
export const FORMULATOR_EXTERNAL_URL = "https://www.naturalyou.it/about-us-detail/";

// Bump this when homepage content materially changes — feeds dateModified
// in webPageJsonLd and the visible "content last reviewed" line, both of
// which are freshness signals AI systems weight for citation. Full ISO 8601
// datetimes, not bare dates — some crawlers only recognize the full form.
export const HOMEPAGE_LAST_UPDATED = "2026-08-24T00:00:00Z";
// The site's actual launch date (first substantive build commit) — used as
// datePublished, distinct from the dateModified value above.
export const HOMEPAGE_PUBLISHED = "2026-08-07T00:00:00Z";
// Display-friendly versions of the two dates above, for visible on-page text.
export const HOMEPAGE_LAST_UPDATED_DISPLAY = "August 24, 2026";
export const HOMEPAGE_PUBLISHED_DISPLAY = "August 7, 2026";

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
  sameAs: [FORMULATOR_EXTERNAL_URL],
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
      sameAs: [FORMULATOR_EXTERNAL_URL],
      jobTitle: "Pharmacist · Cosmetic & Nutraceutical Research",
    },
    publisher: { "@type": "Organization", name: "CHIAREL" },
  };
}

// Describes the on-page "Backed by Published Research" editorial section as
// an Article, distinct from the WebPage schema for the page as a whole —
// some crawlers specifically look for Article/BlogPosting to credit
// datePublished/author signals rather than reading them off WebPage.
export const researchArticleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "CHIAREL Formulation Science: Backed by Published Research",
  description:
    "The published, peer-reviewed research behind CHIAREL's active ingredients — Palmitoyl Pentapeptide-4, Ceramide NP, Niacinamide, and Bioactive Ferment Lysate.",
  datePublished: HOMEPAGE_PUBLISHED,
  dateModified: HOMEPAGE_LAST_UPDATED,
  author: {
    "@type": "Person",
    name: "Grazia Savoriti",
    url: `${SITE_URL}/house`,
    jobTitle: "Pharmacist · Cosmetic & Nutraceutical Research",
  },
  publisher: { "@type": "Organization", name: "CHIAREL", url: SITE_URL },
  mainEntityOfPage: SITE_URL,
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

/** Home -> Shop -> Product Name, etc. Every crumb's item is an absolute URL. */
export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
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
