// src/app/(admin)/menu/page.tsx — CRUD de categorías y productos
// confidence: high
import { db } from "@/lib/db";
import { NuevaCategoriaModal } from "@/components/admin/NuevaCategoriaModal";
import { NuevoProductoModal } from "@/components/admin/NuevoProductoModal";
import { CategoriaList } from "@/components/admin/CategoriaList";
import { ProductoList } from "@/components/admin/ProductoList";

async function getCategoriasConProductos() {
  return await db.categoria.findMany({
    include: {
      productos: { orderBy: { orden: "asc" } },
    },
    orderBy: { orden: "asc" },
  });
}

export default async function AdminMenuPage() {
  const categorias = await getCategoriasConProductos();

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestión de Menú</h1>
        <p className="text-muted-foreground">Administrá categorías y productos</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <NuevaCategoriaModal />
        <NuevoProductoModal categorias={categorias} />
      </div>

      {/* Lista de categorías */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-3">Categorías</h2>
        <div className="bg-card border border-border rounded-xl shadow-md p-4 overflow-hidden">
          <CategoriaList categorias={categorias} />
        </div>
      </section>

      {/* Lista de productos */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-3">Productos</h2>
        <div className="bg-card border border-border rounded-xl shadow-md p-4 overflow-hidden">
          <ProductoList categorias={categorias} />
        </div>
      </section>
    </div>
  );
}
