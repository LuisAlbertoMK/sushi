// src/app/(public)/kaiten/page.tsx — Demo: mesa giratoria kaiten-zushi
// confidence: high — experiencia interactiva de menú estilo restaurante japonés
import type { Metadata } from "next";
import Link from "next/link";
import { KaitenMenu } from "@/components/menu/KaitenMenu";

export const metadata: Metadata = {
  title: "Mesa Kaiten — Sushi Bar",
  description:
    "Explorá el menú sobre una mesa giratoria kaiten-zushi: girala, detenela y elegí tu categoría favorita.",
};

export default function KaitenPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-extrabold text-foreground mb-3">
          🎡 Mesa Kaiten
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Como en un restaurante japonés: los platos giran sobre la mesa.
          Tocá un plato para detenerlo y ver qué hay dentro.
        </p>
        <Link
          href="/menu"
          className="inline-block mt-4 text-sm text-primary-700 dark:text-primary-300 hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
        >
          ← Ver menú clásico
        </Link>
      </div>

      <KaitenMenu />
    </div>
  );
}
