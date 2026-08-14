// src/components/menu/CategoriaTabs.tsx
// confidence: high
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Categoria {
  id: string;
  nombre: string;
  orden: number;
  productos: unknown[];
}

interface Props {
  categorias: Categoria[];
  activa?: string;
}

export function CategoriaTabs({ categorias, activa }: Props) {
  if (!categorias.length) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categorias.map((cat) => {
        const isActive = activa === cat.id;
        return (
          <Link
            key={cat.id}
            href={`/menu?categoria=${cat.id}`}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              isActive
                ? "bg-primary-700 text-white"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-primary-700 border border-border"
            )}
          >
            {cat.nombre}
          </Link>
        );
      })}
    </div>
  );
}
