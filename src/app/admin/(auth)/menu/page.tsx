// src/app/(admin)/menu/page.tsx — CRUD de categorías y productos
// confidence: high
import { db } from "@/lib/db";
import { CategoriaForm } from "@/components/admin/CategoriaForm";
import { ProductoForm } from "@/components/admin/ProductoForm";
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">🍱 Gestión de Menú</h1>
        <p className="text-gray-600">Administrá categorías y productos</p>
      </div>

      {/* Nueva categoría */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">➕ Nueva categoría</h2>
        <CategoriaForm />
      </section>

      {/* Lista de categorías */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">📋 Categorías</h2>
        <CategoriaList categorias={categorias} />
      </section>

      {/* Nuevo producto */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-3">➕ Nuevo producto</h2>
        <ProductoForm categorias={categorias} />
      </section>

      {/* Lista de productos */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">📋 Productos</h2>
        <ProductoList categorias={categorias} />
      </section>
    </div>
  );
}
