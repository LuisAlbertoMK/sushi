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
    <tr className="border-t">
      <td className="py-2 font-medium">{reserva.nombre}</td>
      <td className="py-2">{new Date(reserva.fecha).toLocaleString("es-AR")}</td>
      <td className="py-2">{reserva.personas}</td>
      <td className="py-2">
        <select
          defaultValue={reserva.estado}
          onChange={handleChange}
          className="text-xs border border-border rounded px-1 py-0.5 bg-input text-foreground"
        >
          {estadoOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </td>
      <td className="py-2 text-muted-foreground">
        {reserva.email}
        {reserva.telefono && <span className="block text-xs">{reserva.telefono}</span>}
      </td>
      <td className="py-2 text-center">
        <button onClick={handleDelete} className="text-red-600 hover:text-red-800 text-xs focus-visible:ring-2 focus-visible:ring-ring rounded px-1" aria-label={`Eliminar reserva de ${reserva.nombre}`}>🗑️</button>
      </td>
    </tr>
  );
}