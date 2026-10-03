"use client";
// src/components/admin/ProductoForm.tsx
// confidence: high
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminMutate } from "@/lib/admin-api";

interface Categoria {
  id: string;
  nombre: string;
}

interface Props {
  categorias: Categoria[];
}

export function ProductoForm({ categorias }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      nombre: data.get("nombre") as string,
      descripcion: (data.get("descripcion") as string) || undefined,
      ingredientes: (data.get("ingredientes") as string) || undefined,
      precio: parseFloat(data.get("precio") as string),
      categoriaId: data.get("categoriaId") as string,
      imagen: (data.get("imagen") as string) || undefined,
      disponible: data.get("disponible") === "true",
    };

    const result = await adminMutate("/api/admin/productos", {
      method: "POST",
      body: payload,
    });
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setSuccess("Producto creado!");
    form.reset();
    router.refresh();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card p-4 rounded-xl shadow-md border border-border">
      {error && <p role="alert" aria-live="polite" className="text-destructive-600 dark:text-destructive-foreground text-sm mb-2">{error}</p>}
      {success && <p className="text-green-600 dark:text-green-400 text-sm mb-2">{success}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor="prod-nombre" className="block text-xs font-semibold text-muted-foreground mb-1">Nombre</label>
          <input id="prod-nombre" name="nombre" placeholder="Nombre del producto" required className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground text-sm" />
        </div>
        <div>
          <label htmlFor="prod-precio" className="block text-xs font-semibold text-muted-foreground mb-1">Precio ($)</label>
          <input id="prod-precio" name="precio" type="number" step="0.01" placeholder="Precio ($)" required className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground text-sm" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="prod-desc" className="block text-xs font-semibold text-muted-foreground mb-1">Descripción</label>
          <input id="prod-desc" name="descripcion" placeholder="Descripción" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground text-sm" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="prod-ing" className="block text-xs font-semibold text-muted-foreground mb-1">Ingredientes</label>
          <input id="prod-ing" name="ingredientes" placeholder="Ingredientes (separados por coma)" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground text-sm" />
        </div>
        <div>
          <label htmlFor="prod-cat" className="block text-xs font-semibold text-muted-foreground mb-1">Categoría</label>
          <select id="prod-cat" name="categoriaId" required className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground text-sm">
            <option value="">Seleccionar categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="prod-img" className="block text-xs font-semibold text-muted-foreground mb-1">Imagen (opcional)</label>
          <input id="prod-img" name="imagen" placeholder="URL de imagen (opcional)" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="disponible" value="true" defaultChecked className="h-4 w-4 rounded accent-primary-700" /> Disponible
          </label>
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button type="submit" disabled={loading} className="bg-primary-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-ring transition disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Guardando..." : "Crear Producto"}
          </button>
        </div>
      </div>
    </form>
  );
}
