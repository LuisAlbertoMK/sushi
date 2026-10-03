"use client";
// src/components/admin/ProductoList.tsx
// confidence: high
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatearPrecio } from "@/lib/utils";
import { adminMutate } from "@/lib/admin-api";

interface Categoria {
  id: string;
  nombre: string;
  productos: {
    id: string;
    nombre: string;
    precio: number;
    disponible: boolean;
    orden: number;
    descripcion: string | null;
    imagen: string | null;
    ingredientes: string | null;
  }[];
}

interface Props {
  categorias: Categoria[];
}

// Búsqueda sin acentos ni mayúsculas: "atun" tiene que encontrar "Atún"
const normalizar = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function ProductoList({ categorias }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editPrecio, setEditPrecio] = useState(0);
  const [editCatId, setEditCatId] = useState("");
  const [editDisp, setEditDisp] = useState(true);
  const [editDescripcion, setEditDescripcion] = useState<string | null>(null);
  const [editImagen, setEditImagen] = useState<string | null>(null);
  const [editIngredientes, setEditIngredientes] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("todas");

  const allProducts = useMemo(
    () =>
      categorias.flatMap((c) =>
        c.productos.map((p) => ({ ...p, categoria: c.nombre, categoriaId: c.id }))
      ),
    [categorias]
  );

  // Busca en nombre, categoría e ingredientes. La fila en edición queda exceptuada del
  // filtro: si desapareciera bajo el cursor, el admin perdería el formulario abierto.
  const visibles = useMemo(() => {
    const q = normalizar(query);
    return allProducts.filter((p) => {
      if (editingId === p.id) return true;
      if (catFilter !== "todas" && p.categoriaId !== catFilter) return false;
      if (!q) return true;
      return normalizar(`${p.nombre} ${p.categoria} ${p.ingredientes ?? ""}`).includes(q);
    });
  }, [allProducts, query, catFilter, editingId]);

  const startEdit = (p: typeof allProducts[0]) => {
    setEditingId(p.id);
    setEditNombre(p.nombre);
    setEditPrecio(p.precio);
    setEditCatId(p.categoriaId);
    setEditDisp(p.disponible);
    setEditDescripcion(p.descripcion);
    setEditImagen(p.imagen);
    setEditIngredientes(p.ingredientes);
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
    const result = await adminMutate(`/api/admin/productos/${id}`, {
      method: "PATCH",
      body: {
        nombre: editNombre,
        precio: editPrecio,
        categoriaId: editCatId,
        disponible: editDisp,
        ...(editDescripcion ? { descripcion: editDescripcion } : {}),
        ...(editIngredientes ? { ingredientes: editIngredientes } : {}),
        ...(editImagen ? { imagen: editImagen } : {}),
      },
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

  const deleteProd = async (id: string) => {
    if (!confirm("¿Eliminar producto?")) return;
    setPendingId(id);
    setErrorId(null);
    setErrorMsg(null);
    const result = await adminMutate(`/api/admin/productos/${id}`, { method: "DELETE" });
    setPendingId(null);
    if (!result.ok) {
      setErrorId(id);
      setErrorMsg(result.error);
      return;
    }
    router.refresh();
  };

  if (allProducts.length === 0) return <p className="text-muted-foreground">No hay productos.</p>;

  const filtrando = query.trim() !== "" || catFilter !== "todas";

  return (
    <>
      <div className="space-y-3 mb-3">
        <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3">
          <div className="flex-1">
            <label htmlFor="prod-buscar" className="block text-xs font-semibold text-muted-foreground mb-1">
              Buscar producto
            </label>
            <div className="relative">
              <input
                id="prod-buscar"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setQuery("");
                }}
                placeholder="Nombre, categoría o ingrediente (ej. atun, wasabi)"
                className="w-full px-3 py-2 pr-9 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {query !== "" && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Limpiar búsqueda"
                  title="Limpiar búsqueda"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="sm:w-56">
            <label htmlFor="prod-filtro-cat" className="block text-xs font-semibold text-muted-foreground mb-1">
              Categoría
            </label>
            <select
              id="prod-filtro-cat"
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-muted-foreground" aria-live="polite">
          {visibles.length} de {allProducts.length} productos{filtrando ? " (filtrados)" : ""}
        </p>
      </div>

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
          {visibles.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-muted-foreground">
                No hay productos que coincidan
                {query.trim() !== "" ? ` con «${query.trim()}»` : " con ese filtro"}.
              </td>
            </tr>
          )}
          {visibles.map((p) => (
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
                    <button onClick={() => saveEdit(p.id)} disabled={pendingId === p.id} aria-label="Guardar" title="Guardar" className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring text-base">💾</button>
                    <button onClick={cancelEdit} aria-label="Cancelar" title="Cancelar" className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring text-base">✕</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(p)} aria-label="Editar" title="Editar" className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring text-base">✏️</button>
                    <button onClick={() => deleteProd(p.id)} disabled={pendingId === p.id} aria-label="Eliminar" title="Eliminar" className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring text-base">🗑️</button>
                  </>
                )}
                {errorId === p.id && errorMsg && (
                  <span role="alert" className="block text-xs text-destructive-600 dark:text-destructive-foreground">{errorMsg}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
