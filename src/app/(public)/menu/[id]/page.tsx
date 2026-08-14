// src/app/(public)/menu/[id]/page.tsx — Detalle de producto
// confidence: high
import { db } from "@/lib/db";
import Link from "next/link";
import { SushiImage } from "@/components/ui/SushiImage";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { productSchema, breadcrumbSchema } from "@/lib/seo";

// ISR: revalidar cada hora
export const revalidate = 3600;

async function getProducto(id: string) {
  return await db.producto.findUnique({
    where: { id },
    include: { categoria: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const producto = await getProducto(params.id);
  if (!producto) {
    return { title: "Producto no encontrado | Sushi Bar" };
  }
  return {
    title: `${producto.nombre} — Sushi Bar`,
    description:
      producto.descripcion ||
      `Ordená ${producto.nombre} por ${producto.precio.toFixed(2)}. Sushi fresco hecho al momento.`,
    openGraph: {
      title: `${producto.nombre} — Sushi Bar`,
      description: producto.descripcion || `Ordená ${producto.nombre}.`,
      images: producto.imagen
        ? [{ url: producto.imagen, alt: producto.nombre }]
        : undefined,
    },
  };
}

export default async function ProductoPage({ params }: { params: { id: string } }) {
  const producto = await getProducto(params.id);
  if (!producto) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <JsonLd data={productSchema({
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio,
          imagen: producto.imagen,
          categoria: producto.categoria.nombre,
          url: `/menu/${params.id}`,
      })} />
      <JsonLd data={breadcrumbSchema([
          { name: "Inicio", url: "/" },
          { name: "Menú", url: "/menu" },
          { name: producto.nombre, url: `/menu/${params.id}` },
      ])} />
      <Link href="/menu" className="text-primary-700 hover:underline mb-4 inline-block">
        ← Volver al menú
      </Link>
      <div className="grid md:grid-cols-2 gap-8 bg-card rounded-xl shadow-md p-8">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg aspect-square flex items-center justify-center overflow-hidden">
          {producto.imagen ? (
            <SushiImage
              src={producto.imagen}
              alt={producto.nombre}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover rounded-lg"
              priority
            />
          ) : (
            <span className="text-6xl" aria-hidden="true">
              🍣
            </span>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary-700 mb-2">{producto.nombre}</h1>
          <p className="text-2xl font-bold text-foreground mb-4">${producto.precio.toFixed(2)}</p>

          <span className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 text-xs px-2 py-1 rounded mb-4">
            {producto.categoria.nombre}
          </span>

          {producto.descripcion && (
            <p className="text-gray-600 mt-4 leading-relaxed">{producto.descripcion}</p>
          )}

          <button
            onClick={() => {
              // Agrega al carrito vía fetch (cliente)
              fetch("/api/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productoId: producto.id, cantidad: 1 }),
              });
              alert(`${producto.nombre} agregado al carrito`);
            }}
            className="mt-6 w-full bg-primary-700 dark:bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-800 dark:hover:bg-primary-500 transition focus:outline-none focus:ring-2 focus:ring-ring"
          >
            🛒 Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
