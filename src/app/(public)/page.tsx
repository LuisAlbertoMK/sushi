// src/app/(public)/page.tsx — Landing page
// confidence: high
import Link from "next/link";
import type { Metadata } from "next";
import { SobreNosotros } from "@/components/institucional/SobreNosotros";

export const metadata: Metadata = {
  title: "🍣 Sushi Bar — Sushi Fresco, Pedidos Online y Reservas",
  description:
    "Auténtico sushi fresco hecho al momento. Pedidos online con delivery o reservá tu mesa. Menú: rolls, nigiris, sashimi, combos. Promociones semanales.",
  openGraph: {
    title: "🍣 Sushi Bar — Sushi Fresco, Pedidos Online y Reservas",
    description: "Auténtico sushi fresco hecho al momento. Pedidos online con delivery o reservá tu mesa.",
    images: [{ url: "/og-sushi.jpg", alt: "Sushi Bar — rolls frescos" }],
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
      <section className="text-center py-20 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/sushi-og-placeholder.svg')] opacity-5 bg-cover bg-center" aria-hidden="true"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">🍣 Sushi Bar</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow">
            Auténtico sushi fresco, hecho con pasión. Pedí online o reservá tu mesa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/menu"
              className="bg-white text-primary-700 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Ver Menú
            </Link>
            <Link
              href="/pedidos"
              className="bg-white text-primary-700 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Pedir Ahora
            </Link>
          </div>
        </div>
      </section>

      {/* Historia institucional */}
      <SobreNosotros />

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f) => (
          <Link key={f.href} href={f.href} className="bg-card p-6 rounded-xl shadow-md text-center hover:shadow-lg transition group border border-border">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary-700 dark:group-hover:text-primary-400">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </Link>
        ))}
      </section>

      {/* CTA Reserva */}
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
    </div>
  );
}
