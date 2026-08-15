// src/app/(admin)/reservas/page.tsx — Lista de reservas
// confidence: high
import { db } from "@/lib/db";
import { Reservacion } from "@prisma/client";
import { ReservaRow } from "@/components/admin/ReservaRow";

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
