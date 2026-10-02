// src/components/admin/ReservaRow.tsx
// confidence: high
// Fila de reserva con acciones (cambiar estado + eliminar) — Client Component
// (el padre es Server Component: los event handlers no cruzan el boundary en Next 16)
"use client";

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
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await fetch(`/api/admin/reservas/${reserva.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: e.target.value }),
    });
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar reserva?")) return;
    await fetch(`/api/admin/reservas/${reserva.id}`, { method: "DELETE" });
    window.location.reload();
  };

  return (
    <tr className="border-t border-border hover:bg-muted/40 transition-colors">
      <td className="py-2 pr-2 font-medium text-foreground">{reserva.nombre}</td>
      <td className="py-2 pr-2 text-foreground">{new Date(reserva.fecha).toLocaleString("es-AR")}</td>
      <td className="py-2 pr-2 text-foreground">{reserva.personas}</td>
      <td className="py-2 pr-2">
        <select
          defaultValue={reserva.estado}
          onChange={handleChange}
          aria-label={`Estado de la reserva de ${reserva.nombre}`}
          className="text-sm border border-border rounded-lg px-2 py-1 bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {estadoOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </td>
      <td className="py-2 pr-2 text-muted-foreground">
        {reserva.email}
        {reserva.telefono && <span className="block text-xs">{reserva.telefono}</span>}
      </td>
      <td className="py-2 text-center">
        <button onClick={handleDelete} className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring text-base" aria-label={`Eliminar reserva de ${reserva.nombre}`} title="Eliminar">🗑️</button>
      </td>
    </tr>
  );
}