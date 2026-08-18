// src/components/layout/Header.tsx — Header fijo con navegación + trust + carrito
// confidence: high
"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { Icon } from "@/components/ui/Icon";
import { MiniCartDropdown } from "@/components/pedidos/MiniCartDropdown";
import { useState } from "react";

export function Header() {
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);
  const [showMiniCart, setShowMiniCart] = useState(false);

  return (
    <header className="fixed top-0 z-40 w-full bg-background/80 backdrop-blur border-b border-border supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
          <span className="text-2xl">🍣</span>
          <span className="font-bold text-xl text-primary-700 dark:text-primary-300">Sushi Bar</span>
        </Link>

        {/* Nav principal */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navegación principal">
          <Link
            href="/menu"
            className="text-foreground hover:text-primary-700 dark:hover:text-primary-400 font-medium transition-colors focus:outline-none focus:text-primary-700"
          >
            🍱 Menú
          </Link>
          <Link
            href="/kaiten"
            className="text-foreground hover:text-primary-700 dark:hover:text-primary-400 font-medium transition-colors focus:outline-none focus:text-primary-700"
          >
            🍥 Kaiten
          </Link>
          <Link
            href="/promos"
            className="text-foreground hover:text-primary-700 dark:hover:text-primary-400 font-medium transition-colors focus:outline-none focus:text-primary-700"
          >
            🎁 Promos
          </Link>
          <Link
            href="/reservas"
            className="text-foreground hover:text-primary-700 dark:hover:text-primary-400 font-medium transition-colors focus:outline-none focus:text-primary-700"
          >
            📅 Reservas
          </Link>
        </nav>

        {/* CTA + Carrito */}
        <div className="flex items-center gap-3">
          <Link
            href="/pedidos"
            className="hidden sm:inline-flex items-center gap-2 bg-primary-700 dark:bg-primary-600 text-white px-4 py-2 rounded-full font-bold hover:bg-primary-800 dark:hover:bg-primary-500 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            aria-label="Ver carrito y pedir online"
          >
            <Icon emoji="🛒" label="Carrito" className="text-base" />
            Pedir Ahora
          </Link>

          {/* Floating cart button (mobile + desktop mini-cart) */}
          <div className="relative">
            <button
              onClick={() => setShowMiniCart(!showMiniCart)}
              aria-label={`Carrito (${itemCount} items)`}
              title="Ver carrito"
              className="relative p-2 rounded-full bg-muted hover:bg-accent text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Icon emoji="🛒" label="Carrito" className="text-xl" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-700 dark:bg-primary-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <MiniCartDropdown
              open={showMiniCart}
              onClose={() => setShowMiniCart(false)}
            />
          </div>

          {/* Menú móvil (botón hamburguesa) */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

// Mobile menu toggle (drawer funcional con links)
function MobileMenu() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/menu", label: "🍱 Menú" },
    { href: "/kaiten", label: "🍥 Kaiten" },
    { href: "/promos", label: "🎁 Promos" },
    { href: "/reservas", label: "📅 Reservas" },
    { href: "/pedidos", label: "🛒 Pedir Ahora" },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
        <div className="w-5 h-5 flex flex-col justify-around">
          <span className={`block h-0.5 bg-current rounded transition-all ${open ? "rotate-45 translate-y-2" : ""}`}></span>
          <span className={`block h-0.5 bg-current rounded transition-all ${open ? "opacity-0" : ""}`}></span>
          <span className={`block h-0.5 bg-current rounded transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`}></span>
        </div>
      </button>

      {/* Drawer móvil */}
      {open && (
        <div
          id="mobile-nav"
          className="md:hidden fixed top-[57px] left-0 right-0 z-40 bg-background/95 backdrop-blur border-b border-border shadow-lg animate-in slide-in-from-top-2"
        >
          <nav className="flex flex-col px-4 py-4 space-y-2" aria-label="Navegación móvil">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-foreground hover:text-primary-700 dark:hover:text-primary-400 font-medium py-2.5 px-3 rounded-lg hover:bg-muted transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
