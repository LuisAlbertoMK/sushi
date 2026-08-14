// src/app/(public)/promos/layout.tsx — Metadata + JSON-LD FAQ (server envuelve cliente)
// confidence: high
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchemaPromos, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Promociones y Novedades — Descuentos en Sushi | Sushi Bar",
  description:
    "No te perdás nuestras promociones activas: % OFF, envío gratis, montos fijos. Códigos de descuento incluidos. Sushi fresco con descuento.",
  openGraph: {
    title: "Promociones y Novedades — Sushi Bar",
    description: "Descuentos, envío gratis y ofertas en sushi fresco.",
  },
  alternates: { canonical: "/promos" },
  robots: { index: true, follow: true },
};

export default function PromosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={faqSchemaPromos()} />
      <JsonLd data={breadcrumbSchema([{ name: "Inicio", url: "/" }, { name: "Promos", url: "/promos" }])} />
      {children}
    </>
  );
}
