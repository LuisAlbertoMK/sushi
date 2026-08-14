// src/app/(public)/layout.tsx — Layout público con header y footer
// confidence: high — íconos SVG inline (no dependencias externas)
import Link from "next/link";
import { CartProvider } from "@/lib/cart-context";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-red-50 to-white font-sans">
        <header className="bg-white shadow-sm border-b-2 border-red-100 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">🍣</span>
              <span className="font-bold text-2xl text-red-700">Sushi Bar</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/menu" className="flex items-center gap-2 text-gray-700 hover:text-red-700 transition-colors">
                🍱 Menú
              </Link>
              <Link href="/pedidos" className="flex items-center gap-2 text-gray-700 hover:text-red-700 transition-colors">
                🛒 Pedidos
              </Link>
              <Link href="/reservas" className="flex items-center gap-2 text-gray-700 hover:text-red-700 transition-colors">
                📅 Reservas
              </Link>
              <Link href="/promos" className="flex items-center gap-2 text-gray-700 hover:text-red-700 transition-colors">
                🎁 Promos
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">© {new Date().getFullYear()} Sushi Bar — Todos los derechos reservados</p>
            <p className="text-xs mt-1">Pedidos y reservas online · Entrega a domicilio</p>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
