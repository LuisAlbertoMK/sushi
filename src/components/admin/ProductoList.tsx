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

  if (allProducts.length === 0) return <p className="text-gray-600">No hay productos.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600 border-b">
            <th className="pb-2">Nombre</th>
            <th className="pb-2">Precio</th>
            <th className="pb-2">Categoría</th>
            <th className="pb-2">Disp.</th>
            <th className="pb-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {allProducts.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="py-2">
                {editingId === p.id ? (
                  <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                ) : p.nombre}
              </td>
              <td className="py-2">
                {editingId === p.id ? (
                  <input type="number" step="0.01" value={editPrecio} onChange={(e) => setEditPrecio(parseFloat(e.target.value))} className="w-24 px-2 py-1 border rounded text-sm" />
                ) : formatearPrecio(p.precio)}
              </td>
              <td className="py-2">
                {editingId === p.id ? (
                  <select value={editCatId} onChange={(e) => setEditCatId(e.target.value)} className="px-2 py-1 border rounded text-sm bg-white">
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                ) : p.categoria}
              </td>
              <td className="py-2">
                {editingId === p.id ? (
                  <select value={editDisp ? "true" : "false"} onChange={(e) => setEditDisp(e.target.value === "true")} className="px-2 py-1 border rounded text-sm bg-white">
                    <option value="true">✓</option><option value="false">✗</option>
                  </select>
                ) : (
                  <span className={p.disponible ? "text-green-600" : "text-red-600"}>{p.disponible ? "✓" : "✗"}</span>
                )}
              </td>
              <td className="py-2 text-center space-x-1">
                {editingId === p.id ? (
                  <>
                    <button onClick={() => saveEdit(p.id)} className="text-green-600 hover:underline text-xs">💾</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-600 hover:underline text-xs">✕</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(p)} className="text-blue-600 hover:underline text-xs">✏️</button>
                    <button onClick={() => deleteProd(p.id)} className="text-red-600 hover:underline text-xs">🗑️</button>
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
