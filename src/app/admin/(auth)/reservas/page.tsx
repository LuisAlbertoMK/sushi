// src/app/(admin)/reservas/page.tsx — Lista de reservas
// confidence: high
import { db } from "@/lib/db";
import { ReservaRow } from "@/components/admin/ReservaRow";

const estadoOptions = [
  { value: "PENDIENTE", label: "⏳ Pendiente" },
  { value: "CONFIRMADA", label: "✅ Confirmada" },
  { value: "CANCELADA", label: "❌ Cancelada" },
  { value: "COMPLETADA", label: "🏁 Completada" },
];

export default async function AdminReservasPage() {
  const reservas = await db.reservacion.findMany({
    orderBy: { fecha: "desc" },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reservas</h1>
        <p className="text-muted-foreground">{reservas.length} reservas en total</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-md p-4 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border bg-muted/50">
              <th className="pb-2 pr-2 font-semibold">Nombre</th>
              <th className="pb-2 pr-2 font-semibold">Fecha</th>
              <th className="pb-2 pr-2 font-semibold">Personas</th>
              <th className="pb-2 pr-2 font-semibold">Estado</th>
              <th className="pb-2 pr-2 font-semibold">Contacto</th>
              <th className="pb-2 text-center font-semibold">Acciones</th>
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
    </div>
  );
}
