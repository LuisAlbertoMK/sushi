// src/components/admin/ReservaRow.tsx
// confidence: high
// Fila de reserva con acciones (cambiar estado + eliminar) — Client Component
// (el padre es Server Component: los event handlers no cruzan el boundary en Next 16)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminMutate } from "@/lib/admin-api";

interface ReservaRowProps {
  reserva: {
    id: string;
    nombre: string;
    fecha: Date | string;
    personas: number;
    estado: string;
    email: string;
    telefono: string | null;
  };
  estadoOptions: { value: string; label: string }[];
}

export function ReservaRow({ reserva, estadoOptions }: ReservaRowProps) {
  const router = useRouter();
  const [estado, setEstado] = useState(reserva.estado);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoEstado = e.target.value;
    const previo = estado;
    setEstado(nuevoEstado);
    setSaving(true);
    setError(null);

    const result = await adminMutate(`/api/admin/reservas/${reserva.id}`, {
      method: "PATCH",
      body: { estado: nuevoEstado },
    });
    setSaving(false);
    if (!result.ok) {
      setEstado(previo);
      setError(result.error);
      return;
    }
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar reserva?")) return;
    setDeleting(true);
    setError(null);
    const result = await adminMutate(`/api/admin/reservas/${reserva.id}`, { method: "DELETE" });
    setDeleting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  };

  return (
    <tr className="border-t border-border hover:bg-muted/40 transition-colors">
      <td className="py-2 pr-2 font-medium text-foreground">{reserva.nombre}</td>
      <td className="py-2 pr-2 text-foreground">{new Date(reserva.fecha).toLocaleString("es-AR")}</td>
      <td className="py-2 pr-2 text-foreground">{reserva.personas}</td>
      <td className="py-2 pr-2">
        <select
          value={estado}
          onChange={handleChange}
          disabled={saving}
          aria-label={`Estado de la reserva de ${reserva.nombre}`}
          className="text-sm border border-border rounded-lg px-2 py-1 bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {estadoOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && (
          <span role="alert" className="block text-xs text-destructive-600 dark:text-destructive-foreground">{error}</span>
        )}
      </td>
      <td className="py-2 pr-2 text-muted-foreground">
        {reserva.email}
        {reserva.telefono && <span className="block text-xs">{reserva.telefono}</span>}
      </td>
      <td className="py-2 text-center">
        <button onClick={handleDelete} disabled={deleting} className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring text-base" aria-label={`Eliminar reserva de ${reserva.nombre}`} title="Eliminar">🗑️</button>
      </td>
    </tr>
  );
}
