// src/components/menu/ProductoCard.tsx
// confidence: high
import Link from "next/link";
import { formatearPrecio } from "@/lib/utils";
import { ProductoWithCategoria } from "@/lib/types";

interface Props {
  producto: {
    id: string;
    nombre: string;
    precio: number;
    imagen: string | null;
    descripcion: string | null;
  };
}

export function ProductoCard({ producto }: Props) {
  return (
    <Link href={`/menu/${producto.id}`} className="group block">
      <div className="bg-white rounded-xl shadow-md overflow-hidden group-hover:shadow-lg transition-shadow">
        <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
          {producto.imagen ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-5xl">🍣</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-800 group-hover:text-red-700 transition">
            {producto.nombre}
          </h3>
          <p className="text-xl font-bold text-red-700 my-2">
            {formatearPrecio(producto.precio)}
          </p>
          {producto.descripcion && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {producto.descripcion}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
