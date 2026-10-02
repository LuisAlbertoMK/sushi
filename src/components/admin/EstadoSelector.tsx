"use client";

// src/components/admin/EstadoSelector.tsx — Selector de estado del pedido
// confidence: high
// Client boundary: the handler must live here, not in the server page
// (see commit 2ca5b91: server components cannot carry event handlers).
import { useState } from "react";
import { useRouter } from "next/navigation";

const estadoOptions = [
  { value: "PENDIENTE", label: "⏳ En espera" },
  { value: "EN_COCINA", label: "👨‍🍳 En cocina" },
  { value: "LISTO", label: "✅ Listo" },
  { value: "ENTREGADO", label: "🏠 Entregado" },
  { value: "CANCELADO", label: "❌ Cancelado" },
];

interface Props {
  pedidoId: string;
  currentEstado: string;
}

export function EstadoSelector({ pedidoId, currentEstado }: Props) {
  const router = useRouter();
  const [estado, setEstado] = useState(currentEstado);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoEstado = e.target.value;
    const previo = estado;
    setEstado(nuevoEstado);
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/pedidos/${pedidoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Error ${res.status}`);
      }

      router.refresh();
    } catch {
      setEstado(previo);
      setError("No se pudo actualizar el estado.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-start sm:items-end gap-1">
      <select
        value={estado}
        onChange={handleChange}
        disabled={saving}
        aria-label="Cambiar estado del pedido"
        aria-busy={saving}
        className="text-sm border border-border rounded-lg px-2 py-1 bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-wait"
      >
        {estadoOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span role="alert" className="text-xs text-destructive-600 dark:text-destructive-foreground">
          {error}
        </span>
      )}
    </div>
  );
}
