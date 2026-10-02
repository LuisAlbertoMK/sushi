"use client";
// src/components/admin/ProductoList.tsx
// confidence: high
import { useState } from "react";
import { formatearPrecio } from "@/lib/utils";

interface Categoria {
  id: string;
  nombre: string;
  productos: { id: string; nombre: string; precio: number; disponible: boolean; orden: number }[];
}

interface Props {
  categorias: Categoria[];
}

export function ProductoList({ categorias }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editPrecio, setEditPrecio] = useState(0);
  const [editCatId, setEditCatId] = useState("");
  const [editDisp, setEditDisp] = useState(true);

  const allProducts = categorias.flatMap((c) =>
    c.productos.map((p) => ({ ...p, categoria: c.nombre, categoriaId: c.id }))
  );

  const startEdit = (p: typeof allProducts[0]) => {
    setEditingId(p.id);
    setEditNombre(p.nombre);
    setEditPrecio(p.precio);
    setEditCatId(p.categoriaId);
    setEditDisp(p.disponible);
  };

  const saveEdit = async (id: string) => {
    // Necesitamos buscar la categoría del producto actual para mandar categoriaId
    await fetch(`/api/admin/productos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: editNombre,
        precio: editPrecio,
        categoriaId: editCatId,
        disponible: editDisp,
        descripcion: "",
        imagen: "",
      }),
    });
    setEditingId(null);
    window.location.reload();
  };

  const deleteProd = async (id: string) => {
    if (!confirm("¿Eliminar producto?")) return;
    await fetch(`/api/admin/productos/${id}`, { method: "DELETE" });
    window.location.reload();
  };

  if (allProducts.length === 0) return <p className="text-muted-foreground">No hay productos.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground border-b border-border bg-muted/50">
            <th className="pb-2 pr-2 font-semibold">Nombre</th>
            <th className="pb-2 pr-2 font-semibold">Precio</th>
            <th className="pb-2 pr-2 font-semibold">Categoría</th>
            <th className="pb-2 pr-2 font-semibold">Disp.</th>
            <th className="pb-2 text-center font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {allProducts.map((p) => (
            <tr key={p.id} className="border-t border-border hover:bg-muted/40 transition-colors">
              <td className="py-2 pr-2">
                {editingId === p.id ? (
                  <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} aria-label="Nombre" className="w-full px-2 py-1 border border-border rounded text-sm bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                ) : p.nombre}
              </td>
              <td className="py-2 pr-2">
                {editingId === p.id ? (
                  <input type="number" step="0.01" value={editPrecio} onChange={(e) => setEditPrecio(parseFloat(e.target.value))} aria-label="Precio" className="w-24 px-2 py-1 border border-border rounded text-sm bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                ) : formatearPrecio(p.precio)}
              </td>
              <td className="py-2">
                {editingId === p.id ? (
                  <select value={editCatId} onChange={(e) => setEditCatId(e.target.value)} className="px-2 py-1 border border-border rounded text-sm bg-input text-foreground">
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                ) : p.categoria}
              </td>
              <td className="py-2">
                {editingId === p.id ? (
                  <select value={editDisp ? "true" : "false"} onChange={(e) => setEditDisp(e.target.value === "true")} className="px-2 py-1 border border-border rounded text-sm bg-input text-foreground">
                    <option value="true">✓</option><option value="false">✗</option>
                  </select>
                ) : (
                  <span className={p.disponible ? "text-green-600 dark:text-green-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold"}>{p.disponible ? "✓" : "✗"}</span>
                )}
              </td>
              <td className="py-2 text-center space-x-1">
                {editingId === p.id ? (
                  <>
                    <button onClick={() => saveEdit(p.id)} aria-label="Guardar" title="Guardar" className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring text-base">💾</button>
                    <button onClick={() => setEditingId(null)} aria-label="Cancelar" title="Cancelar" className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring text-base">✕</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(p)} aria-label="Editar" title="Editar" className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring text-base">✏️</button>
                    <button onClick={() => deleteProd(p.id)} aria-label="Eliminar" title="Eliminar" className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring text-base">🗑️</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
