// src/app/(public)/menu/[id]/page.tsx — Detalle de producto
// confidence: high
import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getProducto(id: string) {
  return await db.producto.findUnique({
    where: { id },
    include: { categoria: true },
  });
}

export default async function ProductoPage({ params }: { params: { id: string } }) {
  const producto = await getProducto(params.id);
  if (!producto) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/menu" className="text-red-700 hover:underline mb-4 inline-block">
        ← Volver al menú
      </Link>
      <div className="grid md:grid-cols-2 gap-8 bg-white rounded-xl shadow-md p-8">
        <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center overflow-hidden">
          {producto.imagen ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={producto.imagen} alt={producto.nombre} className="object-cover w-full h-full rounded-lg" />
          ) : (
            <span className="text-6xl">🍣</span>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-red-700 mb-2">{producto.nombre}</h1>
          <p className="text-2xl font-bold text-gray-800 mb-4">${producto.precio.toFixed(2)}</p>

          <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mb-4">
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
            className="mt-6 w-full bg-red-700 text-white py-3 rounded-lg font-bold hover:bg-red-800 transition"
          >
            🛒 Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
