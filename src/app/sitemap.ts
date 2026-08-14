// src/app/sitemap.ts — Sitemap dinámico desde Prisma
// confidence: high
import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain = process.env.NEXT_PUBLIC_SITE_URL || "https://sushi-bar.ar";

  // Sitemap estático de páginas principales
  const routes: MetadataRoute.Sitemap = [
    {
      url: domain,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${domain}/menu`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${domain}/reservas`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/promos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Productos dinámicos (ISR-friendly)
  const productos = await db.producto.findMany({
    where: { disponible: true },
    select: { id: true, updatedAt: true },
  });

  const productoUrls: MetadataRoute.Sitemap = productos.map((p) => ({
    url: `${domain}/menu/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...routes, ...productoUrls];
}
