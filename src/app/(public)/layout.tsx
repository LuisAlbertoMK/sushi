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
        <main id="main-content" className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-muted/30 text-muted-foreground py-8 mt-auto dark:bg-background dark:text-muted-foreground/70">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">© {new Date().getFullYear()} Sushi Bar — Todos los derechos reservados</p>
            <p className="text-xs mt-1 text-muted-foreground/80 dark:text-muted-foreground/60">Pedidos y reservas online · Entrega a domicilio</p>
            {/* Link admin discreto (para el dueño) — dentro del footer, sin pisar ThemeToggle */}
            <Link href="/admin/login" className="inline-block mt-3 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs px-2.5 py-1.5 rounded opacity-40 hover:opacity-100 transition-all dark:bg-muted/50 dark:hover:bg-muted/70 dark:text-muted-foreground dark:hover:text-foreground" aria-label="Admin login">
              admin
            </Link>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
