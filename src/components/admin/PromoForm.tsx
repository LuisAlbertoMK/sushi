"use client";
// src/components/admin/PromoForm.tsx
// confidence: high
import { useState } from "react";

export function PromoForm() {
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
      descripcion: (data.get("descripcion") as string) || undefined,
      imagen: (data.get("imagen") as string) || undefined,
      tipo: data.get("tipo") as string,
      valor: data.get("valor") ? parseFloat(data.get("valor") as string) : undefined,
      codigo: (data.get("codigo") as string) || undefined,
      fechaInicio: data.get("fechaInicio") as string,
      fechaFin: data.get("fechaFin") as string,
      activa: data.get("activa") === "true",
    };

    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Promoción creada!");
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
    <form onSubmit={handleSubmit} className="bg-card p-4 rounded-xl shadow-md border border-border">
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input name="titulo" placeholder="Título de la promoción" required className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground text-sm" />
        <input name="imagen" placeholder="URL de imagen" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground text-sm" />
        <textarea name="descripcion" placeholder="Descripción" rows={2} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground text-sm md:col-span-2"></textarea>
        <select name="tipo" required className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground text-sm">
          <option value="">Tipo de promoción</option>
          <option value="PORCENTUAL">Porcentaje (%) OFF</option>
          <option value="MONTO_FIJO">Monto fijo ($ OFF)</option>
          <option value="ENVIO_GRATIS">Envío gratis</option>
        </select>
        <input name="valor" type="number" step="0.01" placeholder="Valor (ej: 15 para 15%)" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground text-sm" />
        <input name="codigo" placeholder="Código de cupón (opcional)" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground text-sm" />
        <input name="fechaInicio" type="date" required className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground text-sm" />
        <input name="fechaFin" type="date" required className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground text-sm" />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" name="activa" value="true" defaultChecked className="rounded" /> Activa
          </label>
        </div>
        <button type="submit" disabled={loading} className="md:col-span-2 bg-primary-700 text-white py-2 rounded-lg font-bold hover:bg-primary-800 transition disabled:cursor-not-allowed disabled:bg-primary-400 disabled:text-white">
          {loading ? "Guardando..." : "Crear Promoción"}
        </button>
      </div>
    </form>
  );
}
