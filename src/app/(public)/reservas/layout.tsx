// src/app/(public)/reservas/layout.tsx — Metadata + JSON-LD FAQ (server envuelve cliente)
// confidence: high
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchemaReservas, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Reservar Mesa — Sushi Bar | Confirmación Inmediata Online",
  description:
    "Reservá tu mesa online en segundos. Elegí fecha, hora y cantidad de personas. Confirmación inmediata.",
  openGraph: {
    title: "Reservar Mesa — Sushi Bar",
    description: "Reservá tu mesa online. Confirmación inmediata.",
  },
  alternates: { canonical: "/reservas" },
  robots: { index: true, follow: true },
};

export default function ReservasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={faqSchemaReservas()} />
      <JsonLd data={breadcrumbSchema([{ name: "Inicio", url: "/" }, { name: "Reservas", url: "/reservas" }])} />
      {children}
    </>
  );
}
