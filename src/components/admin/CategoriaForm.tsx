"use client";
// src/components/admin/CategoriaForm.tsx
// confidence: high
import { useState } from "react";

export function CategoriaForm() {
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
      orden: parseInt(data.get("orden") as string, 10) || 0,
      activo: data.get("activo") === "true",
    };

    try {
      const res = await fetch("/api/admin/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Categoría creada!");
        form.reset();
        // Refrescar la página para ver la nueva categoría
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <input name="nombre" placeholder="Nombre de la categoría" required className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
        </div>
        <div>
          <input name="orden" type="number" min="0" defaultValue="0" placeholder="Orden" className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" name="activo" value="true" defaultChecked className="rounded" /> Activo
          </label>
        </div>
        <button type="submit" disabled={loading} className="bg-red-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-800 transition disabled:opacity-50">
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
