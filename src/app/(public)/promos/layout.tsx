// src/app/(public)/promos/layout.tsx — Metadata (server envuelve cliente)
// confidence: high
import type { Metadata } from "next";

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
  return <>{children}</>;
}
