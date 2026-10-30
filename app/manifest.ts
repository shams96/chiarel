import type { MetadataRoute } from "next";

// Web app manifest. Icons are solid Ink tiles with the champagne monogram: the
// supplied transparent mark was nearly invisible on light tab strips and was
// filled black or white by iOS and Android.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CHIAREL",
    short_name: "CHIAREL",
    description: "CHIAREL, The House of Clarity. Formulated in Isola del Liri, Italy.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F6F1",
    theme_color: "#1C1A17",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
