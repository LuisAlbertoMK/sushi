// src/app/(public)/page.tsx — Landing page
// confidence: high
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SobreNosotros } from "@/components/institucional/SobreNosotros";
import { Reveal } from "@/components/animations/Reveal";

export const metadata: Metadata = {
  title: "🍣 Sushi Bar — Sushi Fresco, Pedidos Online y Reservas",
  description:
    "Auténtico sushi fresco hecho al momento. Pedidos online con delivery o reservá tu mesa. Menú: rolls, nigiris, sashimi, combos. Promociones semanales.",
  openGraph: {
    title: "🍣 Sushi Bar — Sushi Fresco, Pedidos Online y Reservas",
    description: "Auténtico sushi fresco hecho al momento. Pedidos online con delivery o reservá tu mesa.",
    images: [{ url: "/images/products/01_sushi_variedad.jpg", alt: "Sushi Bar — rolls, nigiris y sashimi frescos" }],
  },
};

const features = [
  { title: "🍱 Menú Digital", desc: "Explorá nuestros rolls, nigiris y especiales frescos", href: "/menu" },
  { title: "🛒 Pedidos Online", desc: "Hacé tu pedido y coordiná la entrega", href: "/pedidos" },
  { title: "📅 Reservas", desc: "Reservá mesa para compartir sushi", href: "/reservas" },
  { title: "🎁 Promociones", desc: "Ofertas y publicaciones nuevas", href: "/promos" },
];

export default function LandingPage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <Reveal from="none" delay={100}>
        <section className="relative text-center py-24 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-enso opacity-60" aria-hidden="true"></div>
        <Image
          src="/images/products/01_sushi_variedad.jpg"
          alt="Sushi Bar — rolls, nigiris y sashimi frescos"
          fill
          sizes="100vw"
          priority
          className="object-cover opacity-[0.18]"
          style={{ objectPosition: "center 30%" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10"></div>
        <div className="relative z-10">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-xl">
            🍣 Sushi Bar
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-lg">
            Auténtico sushi fresco, hecho con pasión. Pedí online o reservá tu mesa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/menu"
              className="bg-white text-primary-700 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
            >
              Ver Menú
            </Link>
            <Link
              href="/pedidos"
              className="bg-amber-400 dark:bg-amber-300 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-amber-300 dark:hover:bg-amber-200 transition shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
            >
              Pedir Ahora
            </Link>
            <Link
              href="/reservas"
              className="border-2 border-white/30 text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              📅 Reservar Mesa
            </Link>
          </div>
        </div>
      </section>
      </Reveal>

      {/* Trust signals */}
      <Reveal delay={80}>
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-muted/60 dark:bg-muted/50 rounded-xl p-4 text-center border border-border">
          <span className="text-2xl mb-1 block">🍣</span>
          <p className="font-bold text-primary-700 dark:text-primary-300">Desde 2018</p>
          <p className="text-xs text-muted-foreground">Tradición japonesa</p>
        </div>
        <div className="bg-muted/60 dark:bg-muted/50 rounded-xl p-4 text-center border border-border">
          <span className="text-2xl mb-1 block">👨‍🍳</span>
          <p className="font-bold text-primary-700 dark:text-primary-300">Chef certificado</p>
          <p className="text-xs text-muted-foreground">Sushi masters</p>
        </div>
        <div className="bg-muted/60 dark:bg-muted/50 rounded-xl p-4 text-center border border-border">
          <span className="text-2xl mb-1 block">🚚</span>
          <p className="font-bold text-primary-700 dark:text-primary-300">30 min</p>
          <p className="text-xs text-muted-foreground">Delivery rápido</p>
        </div>
        <div className="bg-muted/60 dark:bg-muted/50 rounded-xl p-4 text-center border border-border">
          <span className="text-2xl mb-1 block">💳</span>
          <p className="font-bold text-primary-700 dark:text-primary-300">Pago seguro</p>
          <p className="text-xs text-muted-foreground">100% protegido</p>
        </div>
      </section>
      </Reveal>

      {/* Historia institucional */}
      <Reveal delay={60}>
        <SobreNosotros />
      </Reveal>

      {/* Features */}
      <Reveal delay={80}>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f) => (
          <Link key={f.href} href={f.href} className="bg-card p-6 rounded-xl shadow-md text-center hover:shadow-lg transition group border border-border">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary-700 dark:group-hover:text-primary-400">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </Link>
        ))}
      </section>
      </Reveal>

      {/* CTA Reserva */}
      <Reveal delay={60}>
      <section className="text-center py-12 bg-primary-50 dark:bg-primary-950/30 rounded-xl">
        <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-300 mb-4">¿Listo para compartir?</h2>
        <p className="text-muted-foreground mb-6">Reservá mesa y disfrutá de una experiencia única</p>
        <Link
          href="/reservas"
          className="bg-primary-700 text-white px-8 py-3 rounded-full font-bold hover:bg-primary-800 transition focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Reservar Mesa
        </Link>
      </section>
      </Reveal>
    </div>
  );
}
