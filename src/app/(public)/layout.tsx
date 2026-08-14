// src/app/(public)/layout.tsx — Layout público con header y footer
// confidence: high — íconos SVG inline (no dependencias externas)
import Link from "next/link";
import { CartProvider } from "@/lib/cart-context";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessSchema } from "@/lib/seo";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <JsonLd data={localBusinessSchema()} />
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary-50 dark:from-primary-950/30 to-background font-sans">
        <header className="bg-card shadow-sm border-b-2 border-primary-100 sticky top-0 z-10 dark:border-primary-900/30">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">🍣</span>
              <span className="font-bold text-2xl text-primary-700 dark:text-primary-200">Sushi Bar</span>
            </Link>
            <nav className="flex items-center gap-6" aria-label="Navegación principal">
              <Link href="/menu" prefetch aria-label="Ver menú de sushi" className="flex items-center gap-2 text-gray-700 hover:text-primary-700 dark:text-gray-300 dark:hover:text-primary-400 transition-colors focus:outline-none focus:text-primary-700">
                🍱 Menú
              </Link>
              <Link href="/pedidos" prefetch aria-label="Ver carrito y pedir online" className="flex items-center gap-2 text-gray-700 hover:text-primary-700 dark:text-gray-300 dark:hover:text-primary-400 transition-colors focus:outline-none focus:text-primary-700">
                🛒 Pedidos
              </Link>
              <Link href="/reservas" prefetch aria-label="Reservar mesa" className="flex items-center gap-2 text-gray-700 hover:text-primary-700 dark:text-gray-300 dark:hover:text-primary-400 transition-colors focus:outline-none focus:text-primary-700">
                📅 Reservas
              </Link>
              <Link href="/promos" prefetch aria-label="Ver promociones" className="flex items-center gap-2 text-gray-700 hover:text-primary-700 dark:text-gray-300 dark:hover:text-primary-400 transition-colors focus:outline-none focus:text-primary-700">
                🎁 Promos
              </Link>
            </nav>
          </div>
        </header>
        <main id="main-content" className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-gray-900 text-gray-300 py-8 mt-auto dark:bg-gray-950 dark:text-gray-400">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">© {new Date().getFullYear()} Sushi Bar — Todos los derechos reservados</p>
            <p className="text-xs mt-1">Pedidos y reservas online · Entrega a domicilio</p>
          </div>
          {/* Link admin discreto (para el dueño) — contraste accesible + dark mode */}
          <Link href="/admin/login" className="fixed bottom-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900 text-xs px-2.5 py-1.5 rounded opacity-40 hover:opacity-100 transition-all dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white" aria-label="Admin login">
            admin
          </Link>
        </footer>
      </div>
    </CartProvider>
  );
}
