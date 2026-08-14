"use client";
// src/components/admin/CategoriaList.tsx
// confidence: high
import { useState } from "react";

interface Categoria {
  id: string;
  nombre: string;
  orden: number;
  activo: boolean;
  productos: { id: string }[];
}

interface Props {
  categorias: Categoria[];
}

export function CategoriaList({ categorias }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editOrden, setEditOrden] = useState(0);
  const [editActivo, setEditActivo] = useState(true);

  const startEdit = (cat: Categoria) => {
    setEditingId(cat.id);
    setEditNombre(cat.nombre);
    setEditOrden(cat.orden);
    setEditActivo(cat.activo);
  };

  const saveEdit = async (id: string) => {
    await fetch(`/api/admin/categorias/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: editNombre, orden: editOrden, activo: editActivo }),
    });
    setEditingId(null);
    window.location.reload();
  };

  const deleteCat = async (id: string) => {
    if (!confirm("¿Estás seguro? No se puede deshacer.")) return;
    await fetch(`/api/admin/categorias/${id}`, { method: "DELETE" });
    window.location.reload();
  };

  if (categorias.length === 0) return <p className="text-gray-600">No hay categorías.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600 border-b">
            <th className="pb-2">Nombre</th>
            <th className="pb-2">Orden</th>
            <th className="pb-2">Activo</th>
            <th className="pb-2">Productos</th>
            <th className="pb-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat.id} className="border-t">
              <td className="py-2">
                {editingId === cat.id ? (
                  <input
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-400 rounded text-sm"
                  />
                ) : (
                  cat.nombre
                )}
              </td>
              <td className="py-2">
                {editingId === cat.id ? (
                  <input
                    type="number"
                    value={editOrden}
                    onChange={(e) => setEditOrden(parseInt(e.target.value, 10))}
                    className="w-16 px-2 py-1 border border-gray-400 rounded text-sm"
                  />
                ) : (
                  cat.orden
                )}
              </td>
              <td className="py-2">
                {editingId === cat.id ? (
                  <select
                    value={editActivo ? "true" : "false"}
                    onChange={(e) => setEditActivo(e.target.value === "true")}
                    className="px-2 py-1 border border-gray-400 rounded text-sm bg-white"
                  >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <span className={cat.activo ? "text-green-600" : "text-red-600"}>
                    {cat.activo ? "✓" : "✗"}
                  </span>
                )}
              </td>
              <td className="py-2 text-gray-600">{cat.productos.length}</td>
              <td className="py-2 text-center space-x-1">
                {editingId === cat.id ? (
                  <>
                    <button onClick={() => saveEdit(cat.id)} className="text-green-600 hover:underline text-xs">💾</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-600 hover:underline text-xs">✕</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(cat)} className="text-blue-600 hover:underline text-xs">✏️</button>
                    <button onClick={() => deleteCat(cat.id)} className="text-red-600 hover:underline text-xs">🗑️</button>
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
