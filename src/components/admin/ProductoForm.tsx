"use client";
// src/components/admin/ProductoForm.tsx
// confidence: high
import { useState } from "react";

interface Categoria {
  id: string;
  nombre: string;
}

interface Props {
  categorias: Categoria[];
}

export function ProductoForm({ categorias }: Props) {
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
      precio: parseFloat(data.get("precio") as string),
      categoriaId: data.get("categoriaId") as string,
      imagen: (data.get("imagen") as string) || undefined,
      disponible: data.get("disponible") === "true",
    };

    try {
      const res = await fetch("/api/admin/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Producto creado!");
        form.reset();
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-md">
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <input name="nombre" placeholder="Nombre del producto" required className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
        </div>
        <div>
          <input name="precio" type="number" step="0.01" placeholder="Precio ($)" required className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
        </div>
        <div className="md:col-span-2">
          <input name="descripcion" placeholder="Descripción" className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
        </div>
        <div>
          <select name="categoriaId" required className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white">
            <option value="">Seleccionar categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <input name="imagen" placeholder="URL de imagen (opcional)" className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" name="disponible" value="true" defaultChecked className="rounded" /> Disponible
          </label>
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button type="submit" disabled={loading} className="bg-red-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-800 transition disabled:opacity-50">
            {loading ? "Guardando..." : "Crear Producto"}
          </button>
        </div>
      </div>
    </form>
  );
}
