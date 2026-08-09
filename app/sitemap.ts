import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/ritual",
    "/shop",
    "/science",
    "/science/comparison",
    "/science/barrier-resilience",
    "/science/lasting-hydration",
    "/science/synergy",
    "/science/application",
    "/science/ectoine",
    "/science/bifida-ferment-lysate",
    "/science/l-ornithine",
    "/house",
    "/journal",
    "/journal/chiarel-ritual-guide",
    "/journal/three-skins-one-house",
    "/journal/isola-del-liri-waterfall",
    "/journal/reading-a-label",
    "/assessment",
    "/press",
    "/founding-100",
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const productRoutes = products.map((p) => ({
    url: `${SITE_URL}/shop/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
