"use client";
// src/components/admin/CategoriaForm.tsx
// confidence: high
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminMutate } from "@/lib/admin-api";

interface Props {
  onSuccess?: () => void;
}

export function CategoriaForm({ onSuccess }: Props) {
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
      orden: parseInt(data.get("orden") as string, 10) || 0,
      activo: data.get("activo") === "true",
    };

    const result = await adminMutate("/api/admin/categorias", {
      method: "POST",
      body: payload,
    });
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setSuccess("Categoría creada!");
    form.reset();
    router.refresh();
    setLoading(false);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card p-4 rounded-xl shadow-md border border-border">
      {error && <p role="alert" aria-live="polite" className="text-destructive-600 dark:text-destructive-foreground text-sm mb-2">{error}</p>}
      {success && <p className="text-green-600 dark:text-green-400 text-sm mb-2">{success}</p>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label htmlFor="cat-nombre" className="block text-xs font-semibold text-muted-foreground mb-1">Nombre</label>
          <input id="cat-nombre" name="nombre" placeholder="Nombre de la categoría" required className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground text-sm" />
        </div>
        <div>
          <label htmlFor="cat-orden" className="block text-xs font-semibold text-muted-foreground mb-1">Orden</label>
          <input id="cat-orden" name="orden" type="number" min="0" defaultValue="0" placeholder="Orden" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground text-sm" />
        </div>
        <div className="flex items-end gap-2 pb-1">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="activo" value="true" defaultChecked className="h-4 w-4 rounded accent-primary-700" /> Activo
          </label>
        </div>
        <button type="submit" disabled={loading} className="bg-primary-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-ring transition disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
