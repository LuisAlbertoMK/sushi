// src/components/layout/Footer.tsx — Footer institucional con redes + legal
// confidence: high
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 pt-12 pb-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo + Tagline */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 text-white">
              <span className="text-3xl">🍣</span>
              <span className="font-bold text-2xl text-primary-300">Sushi Bar</span>
            </Link>
            <p className="text-sm">Sushi fresco hecho al momento. Pedidos online con delivery y reservas.</p>
            <div className="flex gap-3">
              <Link
                href="https://instagram.com/sushibar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 dark:text-gray-400 hover:text-primary-400 transition text-2xl"
                aria-label="Instagram"
              >
                📷
              </Link>
              <Link
                href="https://wa.me/5491112345678"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 dark:text-gray-400 hover:text-primary-400 transition text-2xl"
                aria-label="WhatsApp"
              >
                💬
              </Link>
            </div>
          </div>

          {/* Servicios */}
          <div className="space-y-3">
            <h4 className="text-white font-bold mb-3">Servicios</h4>
            <Link href="/menu" className="block text-sm hover:text-primary-300 transition">Menú Digital</Link>
            <Link href="/pedidos" className="block text-sm hover:text-primary-300 transition">Pedidos Online</Link>
            <Link href="/reservas" className="block text-sm hover:text-primary-300 transition">Reservas</Link>
            <Link href="/promos" className="block text-sm hover:text-primary-300 transition">Promociones</Link>
          </div>

          {/* Horarios */}
          <div className="space-y-3">
            <h4 className="text-white font-bold mb-3">Horarios</h4>
            <p className="text-sm">Lun–Jue: 12:00–22:00</p>
            <p className="text-sm">Vie–Sáb: 12:00–23:00</p>
            <p className="text-sm">Dom: 13:00–21:00</p>
            <p className="text-sm mt-2">📍 Av. Corrientes 1234, CABA</p>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-white font-bold mb-3">Legal</h4>
            <a href="/terminos" className="block text-sm hover:text-primary-300 transition">Términos y Condiciones</a>
            <a href="/privacidad" className="block text-sm hover:text-primary-300 transition">Política de Privacidad</a>
            <a href="/contacto" className="block text-sm hover:text-primary-300 transition">Contacto</a>
            {/* Link admin discreto (para el dueño) — sin pisar ThemeToggle */}
            <Link href="/admin/login" className="inline-block mt-2 bg-gray-800 dark:bg-gray-900 hover:bg-gray-700 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-200 dark:text-gray-500 dark:hover:text-gray-300 text-xs px-2.5 py-1 rounded opacity-40 hover:opacity-100 transition-all" aria-label="Admin login">
              admin
            </Link>
          </div>
        </div>

        <hr className="border-gray-800 dark:border-gray-700 mb-4" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-600">
            © {currentYear} Sushi Bar — Todos los derechos reservados
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-600">
            Pedidos y reservas online · Entrega a domicilio
          </p>
        </div>
      </div>
    </footer>
  );
}
