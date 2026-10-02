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
    <div className="space-y-8 kaiten-page">
      {/* Experiment kaiten-hero-moderno (T1): hero premium, solo visual */}
      <section
        aria-labelledby="kaiten-hero-title"
        className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-lg"
      >
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary-500/15 blur-[100px] dark:bg-primary-700/25" />
          <div className="absolute inset-0 bg-enso opacity-40" />
        </div>
        <div className="relative z-10 px-6 py-10 text-center sm:px-12 sm:py-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Mesa kaiten · como en Japón
          </span>
          <h1
            id="kaiten-hero-title"
            className="font-bebas mt-5 text-5xl font-extrabold uppercase leading-none tracking-wide sm:text-6xl"
          >
            Mesa{" "}
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-amber-500 bg-clip-text text-transparent dark:from-amber-200 dark:via-amber-400 dark:to-primary-400">
              Kaiten
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Arrastrá la mesa para girar · tocá un plato para ver detalles · tocá un platillo para pedirlo.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/reservas"
              className="inline-flex items-center justify-center rounded-full bg-primary-700 px-7 py-3 text-sm font-bold text-white transition hover:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-500"
            >
              Reservar mesa
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-7 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              ← Ver menú clásico
            </Link>
          </div>
          <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-5">
            <div>
              <p className="text-lg font-extrabold">Girá</p>
              <p className="mt-0.5 text-xs text-muted-foreground">arrastrá la cinta</p>
            </div>
            <div>
              <p className="text-lg font-extrabold">Elegí</p>
              <p className="mt-0.5 text-xs text-muted-foreground">tocá un plato</p>
            </div>
            <div>
              <p className="text-lg font-extrabold">Pedí</p>
              <p className="mt-0.5 text-xs text-muted-foreground">al carrito directo</p>
            </div>
          </div>
        </div>
      </section>

      <KaitenMenu />
    </div>
  );
}
