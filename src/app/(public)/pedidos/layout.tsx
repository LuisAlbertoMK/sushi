// src/app/(public)/pedidos/layout.tsx — Metadata noindex (carrito privado)
// confidence: high
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tu Carrito — Pedido Online | Sushi Bar",
  description: "Hacé tu pedido de sushi online. Carrito privado.",
  robots: { index: false, follow: true },
};

export default function PedidosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
