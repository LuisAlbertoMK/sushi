// src/app/demos/moderno/page.tsx — Isolated demo: premium dark hero (does not affect landing)
// Design goals: glassmorphism, display type, clear hierarchy, floating proof cards.
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/animations/Reveal";

export const metadata: Metadata = {
  title: "Demo — Hero premium oscuro",
  description:
    "Demo aislado de hero premium oscuro para Sushi Bar. No afecta a la landing.",
  robots: { index: false, follow: false },
};

const proof = [
  { value: "4.9", label: "Rating delivery" },
  { value: "30 min", label: "Promedio entrega" },
  { value: "+12k", label: "Rolls por mes" },
];

export default function DemoModernoPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <p className="mb-4 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Demo aislado · no afecta a la landing ·{" "}
        <Link href="/" className="underline underline-offset-4 hover:text-foreground">
          Volver al inicio
        </Link>
      </p>

      <Reveal from="none">
        <section
          aria-labelledby="demo-hero-title"
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 text-zinc-100 shadow-2xl"
        >
          {/* Background layers: radial gold glow + subtle grid + dark vignette */}
          <div aria-hidden="true" className="absolute inset-0">
            <div className="absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary-700/30 blur-[120px]" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 to-transparent" />
            <div
              className="absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
                maskImage:
                  "radial-gradient(ellipse 80% 70% at 50% 30%, black 30%, transparent 75%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 70% at 50% 30%, black 30%, transparent 75%)",
              }}
            />
          </div>

          <div className="relative z-10 grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[1.05fr_0.95fr] lg:p-16">
            {/* Copy */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-zinc-200 backdrop-blur-md">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Nuevo · Omakase de temporada
              </span>

              <h1
                id="demo-hero-title"
                className="font-display mt-6 text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
              >
                Sushi fresco,
                <span className="block bg-gradient-to-r from-amber-200 via-amber-400 to-primary-400 bg-clip-text text-transparent">
                  nivel omakase.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                Pedí online o reservá mesa en segundos. Rolls, nigiris y
                sashimi hechos al momento, con delivery en 30 minutos.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/menu"
                  className="inline-flex items-center justify-center rounded-full bg-zinc-100 px-8 py-3.5 text-base font-bold text-zinc-950 transition hover:bg-white hover:shadow-[0_8px_40px_rgba(255,255,255,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Ver menú
                </Link>
                <Link
                  href="/reservas"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-3.5 text-base font-bold text-white backdrop-blur-md transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Reservar mesa
                </Link>
              </div>

              <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
                {proof.map((p) => (
                  <div key={p.label}>
                    <dt className="order-2 mt-1 block text-xs text-zinc-500">{p.label}</dt>
                    <dd className="text-xl font-extrabold tracking-tight text-white">{p.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl border border-white/15 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                <Image
                  src="/images/products/01_sushi_variedad.jpg"
                  alt="Selección premium de rolls, nigiris y sashimi"
                  width={880}
                  height={880}
                  priority
                  className="aspect-square w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />
              </div>

              {/* Floating glass cards */}
              <div className="absolute -left-3 top-6 rounded-2xl border border-white/20 bg-zinc-900/70 px-4 py-3 shadow-xl backdrop-blur-xl sm:-left-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Combo del día
                </p>
                <p className="text-sm font-bold text-white">Omakase 30 piezas · $24.900</p>
              </div>
              <div className="absolute -bottom-4 right-4 flex items-center gap-3 rounded-2xl border border-white/20 bg-zinc-900/70 px-4 py-3 shadow-xl backdrop-blur-xl">
                <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-lg">
                  ●
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Delivery en camino</p>
                  <p className="text-xs text-zinc-400">Llega en ~18 min</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={100}>
        <div className="mx-auto mt-6 max-w-3xl text-center text-sm text-muted-foreground">
          <p>
            Qué cambió vs la landing: tipografía display sin emoji, jerarquía
            real (eyebrow → H1 → prueba social), CTAs con contraste AA sobre
            oscuro y tarjetas flotantes de vidrio en vez de cards planas.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
