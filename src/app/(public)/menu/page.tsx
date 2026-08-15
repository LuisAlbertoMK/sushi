// src/app/(public)/menu/page.tsx — Menú digital público
// confidence: high
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menú Digital — Rolls, Nigiris, Combos y Especiales | Sushi Bar",
  description:
    "Explorá nuestro menú completo: rolls frescos, nigiris, sashimi, combos familiares y postres. Precios actualizados. Pedí online con delivery.",
  openGraph: {
    title: "Menú Digital — Sushi Bar",
    description: "Explorá nuestro menú completo: rolls, nigiris, combos y especiales.",
  },
  alternates: { canonical: "/menu" },
};

import { ProductoCard } from "@/components/menu/ProductoCard";
import { CategoriaTabs } from "@/components/menu/CategoriaTabs";
import { Suspense } from "react";

type Categoria = {
  id: string;
  nombre: string;
  orden: number;
  productos: { id: string; nombre: string; precio: number; imagen: string | null; descripcion: string | null; disponible: boolean }[];
};

async function getCategorias(): Promise<Categoria[]> {
  const categorias = await db.categoria.findMany({
    where: { activo: true },
    include: {
      productos: {
        where: { disponible: true },
        orderBy: { orden: "asc" },
      },
    },
    orderBy: { orden: "asc" },
  });
  return categorias.map((c) => ({
    ...c,
    productos: c.productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      imagen: p.imagen,
      descripcion: p.descripcion,
      disponible: p.disponible,
    })),
  }));
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: { categoria?: string };
}) {
  const categoriaSeleccionada = searchParams.categoria || undefined;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-primary-700 mb-2">🍣 Nuestro Menú</h1>
        <p className="text-muted-foreground">Ingredientes frescos, preparado al momento</p>
      </div>

      <Suspense fallback={<p>Cargando categorías...</p>}>
        <CategoriaTabsLoader categoriaSeleccionada={categoriaSeleccionada} />
      </Suspense>
    </div>
  );
}

async function CategoriaTabsLoader({ categoriaSeleccionada }: { categoriaSeleccionada?: string }) {
  const categorias = await getCategorias();

  // Si la categoría seleccionada no existe, usar la primera
  const catValid = categoriaSeleccionada
    ? categorias.find((c) => c.id === categoriaSeleccionada) || categorias[0]
    : categorias[0];

  const productosVisibles = catValid?.productos || [];

  return (
    <>
      <CategoriaTabs categorias={categorias} activa={catValid?.id} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {productosVisibles.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-8">
            Próximamente nuevas delicias en esta categoría 👨‍🍳
          </p>
        ) : (
          productosVisibles.map((p) => <ProductoCard key={p.id} producto={p} />)
        )}
      </div>
    </>
  );
}
