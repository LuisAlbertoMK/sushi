// src/app/(admin)/reservas/page.tsx — Lista de reservas
// confidence: high
import { db } from "@/lib/db";
import { Reservacion } from "@prisma/client";

const estadoOptions = [
  { value: "PENDIENTE", label: "⏳ Pendiente" },
  { value: "CONFIRMADA", label: "✅ Confirmada" },
  { value: "CANCELADA", label: "❌ Cancelada" },
  { value: "COMPLETADA", label: "🏁 Completada" },
];

const estadoLabels: Record<string, string> = {
  PENDIENTE: "⏳ Pendiente",
  CONFIRMADA: "✅ Confirmada",
  CANCELADA: "❌ Cancelada",
  COMPLETADA: "🏁 Completada",
};

export default async function AdminReservasPage() {
  const reservas = await db.reservacion.findMany({
    orderBy: { fecha: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">📅 Reservas</h1>
        <p className="text-gray-600">{reservas.length} reservas en total</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="pb-2">Nombre</th>
              <th className="pb-2">Fecha</th>
              <th className="pb-2">Personas</th>
              <th className="pb-2">Estado</th>
              <th className="pb-2">Contacto</th>
              <th className="pb-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <ReservaRow key={r.id} reserva={r} estadoOptions={estadoOptions} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReservaRow({ reserva, estadoOptions }: { reserva: Reservacion; estadoOptions: { value: string; label: string }[] }) {
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
      <td className="py-2 text-gray-600">
        {reserva.email}
        {reserva.telefono && <span className="block text-xs">{reserva.telefono}</span>}
      </td>
      <td className="py-2 text-center">
        <button onClick={handleDelete} className="text-red-600 hover:text-red-800 text-xs">🗑️</button>
      </td>
    </tr>
  );
}
