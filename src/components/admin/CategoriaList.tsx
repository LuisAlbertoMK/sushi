"use client";
// src/components/admin/CategoriaList.tsx
// confidence: high
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminMutate } from "@/lib/admin-api";

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
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editOrden, setEditOrden] = useState(0);
  const [editActivo, setEditActivo] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startEdit = (cat: Categoria) => {
    setEditingId(cat.id);
    setEditNombre(cat.nombre);
    setEditOrden(cat.orden);
    setEditActivo(cat.activo);
    setErrorId(null);
    setErrorMsg(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setErrorId(null);
    setErrorMsg(null);
  };

  const saveEdit = async (id: string) => {
    setPendingId(id);
    setErrorId(null);
    setErrorMsg(null);
    const result = await adminMutate(`/api/admin/categorias/${id}`, {
      method: "PATCH",
      body: { nombre: editNombre, orden: editOrden, activo: editActivo },
    });
    setPendingId(null);
    if (!result.ok) {
      setErrorId(id);
      setErrorMsg(result.error);
      return;
    }
    setEditingId(null);
    router.refresh();
  };

  const deleteCat = async (id: string) => {
    if (!confirm("¿Estás seguro? No se puede deshacer.")) return;
    setPendingId(id);
    setErrorId(null);
    setErrorMsg(null);
    const result = await adminMutate(`/api/admin/categorias/${id}`, { method: "DELETE" });
    setPendingId(null);
    if (!result.ok) {
      setErrorId(id);
      setErrorMsg(result.error);
      return;
    }
    router.refresh();
  };

  if (categorias.length === 0) return <p className="text-muted-foreground">No hay categorías.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground border-b border-border bg-muted/50">
            <th className="pb-2 pr-2 font-semibold">Nombre</th>
            <th className="pb-2 pr-2 font-semibold">Orden</th>
            <th className="pb-2 pr-2 font-semibold">Activo</th>
            <th className="pb-2 pr-2 font-semibold">Productos</th>
            <th className="pb-2 text-center font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat.id} className="border-t border-border hover:bg-muted/40 transition-colors">
              <td className="py-2">
                {editingId === cat.id ? (
                  <input
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="w-full px-2 py-1 border border-border rounded text-sm bg-input text-foreground"
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
                    className="w-16 px-2 py-1 border border-border rounded text-sm bg-input text-foreground"
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
                    className="px-2 py-1 border border-border rounded text-sm bg-input text-foreground"
                  >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <span className={cat.activo ? "text-green-600 dark:text-green-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold"}>
                    {cat.activo ? "✓" : "✗"}
                  </span>
                )}
              </td>
              <td className="py-2 text-muted-foreground">{cat.productos.length}</td>
              <td className="py-2 text-center space-x-1">
                {editingId === cat.id ? (
                  <>
                    <button onClick={() => saveEdit(cat.id)} disabled={pendingId === cat.id} aria-label="Guardar" title="Guardar" className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring text-base">💾</button>
                    <button onClick={cancelEdit} aria-label="Cancelar" title="Cancelar" className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring text-base">✕</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(cat)} aria-label="Editar" title="Editar" className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring text-base">✏️</button>
                    <button onClick={() => deleteCat(cat.id)} disabled={pendingId === cat.id} aria-label="Eliminar" title="Eliminar" className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring text-base">🗑️</button>
                  </>
                )}
                {errorId === cat.id && errorMsg && (
                  <span role="alert" className="block text-xs text-destructive-600 dark:text-destructive-foreground">{errorMsg}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
