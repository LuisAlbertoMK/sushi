// src/app/(public)/pedidos/track/layout.tsx — Metadata noindex (tracking privado)
// confidence: high
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seguimiento de Pedido | Sushi Bar",
  description: "Seguí el estado de tu pedido de sushi.",
  robots: { index: false, follow: false },
};

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
