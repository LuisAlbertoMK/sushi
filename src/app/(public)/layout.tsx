// src/app/(public)/layout.tsx — Layout público con header (con carrito)
// confidence: high — íconos SVG inline (no dependencias externas)
import { CartProvider } from "@/lib/cart-context";
import { JsonLd } from "@/components/seo/JsonLd";
import { Header } from "@/components/layout/Header";
import { localBusinessSchema } from "@/lib/seo";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <JsonLd data={localBusinessSchema()} />
      {/* Header usa useCart() -> debe vivir DENTRO del CartProvider */}
      <Header />
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary-50 dark:from-primary-900/30 to-background font-sans">
        {/* pt-20: deja espacio para el header fixed. El Footer institucional vive en el root layout */}
        <div className="flex-1 container mx-auto px-4 pt-20 pb-8">
          {children}
        </div>
      </div>
    </CartProvider>
  );
}
