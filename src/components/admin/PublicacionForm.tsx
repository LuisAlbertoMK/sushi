"use client";
// src/components/admin/PublicacionForm.tsx
// confidence: high
import { useState } from "react";

export function PublicacionForm() {
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
      titulo: data.get("titulo") as string,
      contenido: (data.get("contenido") as string) || undefined,
      imagen: (data.get("imagen") as string) || undefined,
      publicada: data.get("publicada") === "true",
      fechaPublica: data.get("fechaPublica") as string || new Date().toISOString().split("T")[0],
    };

    try {
      const res = await fetch("/api/admin/publicaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Publicación creada!");
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
      <div className="grid grid-cols-1 gap-3">
        <input name="titulo" placeholder="Título de la publicación" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
        <input name="imagen" placeholder="URL de imagen (opcional)" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
        <textarea name="contenido" placeholder="Contenido..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"></textarea>
        <input name="fechaPublica" type="date" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" name="publicada" value="true" defaultChecked className="rounded" /> Publicada
          </label>
        </div>
        <button type="submit" disabled={loading} className="bg-red-700 text-white py-2 rounded-lg font-bold hover:bg-red-800 transition disabled:opacity-50">
          {loading ? "Guardando..." : "Crear Publicación"}
        </button>
      </div>
    </form>
  );
}
