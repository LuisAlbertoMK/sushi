// src/app/robots.ts — Control de indexación
// confidence: high
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const domain = process.env.NEXT_PUBLIC_SITE_URL || "https://sushi-bar.ar";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/pedidos", "/pedidos/track"],
    },
    sitemap: `${domain}/sitemap.xml`,
  };
}
