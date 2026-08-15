// src/components/menu/ProductoCard.tsx
// confidence: high
import Link from "next/link";
import { SushiImage } from "@/components/ui/SushiImage";
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
      {/* hover suave: lift + sombra + borde dorado, easing decelerado (300ms) */}
      <div className="bg-card rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:shadow-xl group-hover:-translate-y-1.5 group-hover:border-primary-700/30 border border-border">
        <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
          {producto.imagen ? (
            <SushiImage
              src={producto.imagen}
              alt={producto.nombre}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
            />
          ) : (
            <span className="text-5xl" aria-hidden="true">
              🍣
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-foreground transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-primary-700 dark:group-hover:text-primary-400">
            {producto.nombre}
          </h3>
          <p className="text-xl font-bold text-primary-700 dark:text-primary-400 my-2">
            {formatearPrecio(producto.precio)}
          </p>
          {producto.descripcion && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {producto.descripcion}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
