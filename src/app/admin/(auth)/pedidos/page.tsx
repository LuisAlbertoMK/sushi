// src/app/(admin)/pedidos/page.tsx — Lista de pedidos con cambio de estado
// confidence: high
import { db } from "@/lib/db";
import { formatearPrecio } from "@/lib/utils";
import { PedidoWithItems } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

const estadoOptions = [
  { value: "PENDIENTE", label: "⏳ En espera" },
  { value: "EN_COCINA", label: "👨‍🍳 En cocina" },
  { value: "LISTO", label: "✅ Listo" },
  { value: "ENTREGADO", label: "🏠 Entregado" },
  { value: "CANCELADO", label: "❌ Cancelado" },
];

const estadoLabels: Record<string, string> = {
  PENDIENTE: "⏳ En espera",
  EN_COCINA: "👨‍🍳 En cocina",
  LISTO: "✅ Listo",
  ENTREGADO: "🏠 Entregado",
  CANCELADO: "❌ Cancelado",
};

export default async function AdminPedidosPage() {
  const pedidos = await db.pedido.findMany({
    include: { items: { include: { producto: true } }, user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">🛒 Pedidos</h1>
        <p className="text-muted-foreground">{pedidos.length} pedidos en total</p>
      </div>

      <div className="space-y-4">
        {pedidos.map((pedido) => (
          <PedidoCard key={pedido.id} pedido={pedido} />
        ))}
      </div>
    </div>
  );
}

function PedidoCard({ pedido }: { pedido: PedidoWithItems }) {
  return (
    <div className="bg-card rounded-xl shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{pedido.numero}</h2>
          <p className="text-sm text-muted-foreground">
            {pedido.nombre} · {pedido.email} · {pedido.telefono}
          </p>
          <p className="text-xs text-muted-foreground/70 dark:text-muted-foreground/60">
            Creado: {new Date(pedido.createdAt).toLocaleString("es-AR")}
          </p>
        </div>
        <EstadoSelector pedidoId={pedido.id} currentEstado={pedido.estado} />
      </div>

      <div className="mb-4">
        <Badge
          variant={
            pedido.estado === "PENDIENTE" ? "pending" :
            pedido.estado === "EN_COCINA" ? "cooking" :
            pedido.estado === "LISTO" ? "ready" :
            pedido.estado === "ENTREGADO" ? "delivered" :
            pedido.estado === "CANCELADO" ? "cancelled" : "default"
          }
        >
          {estadoLabels[pedido.estado] || pedido.estado}
        </Badge>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground border-b border-border">
            <th className="pb-1">Producto</th>
            <th className="pb-1 text-center">Cant.</th>
            <th className="pb-1 text-right">Precio</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((item) => (
            <tr key={item.id} className="border-t border-border">
              <td className="py-1 text-foreground">{item.producto.nombre}{item.notas ? ` (${item.notas})` : ""}</td>
              <td className="py-1 text-center">{item.cantidad}</td>
              <td className="py-1 text-right">{formatearPrecio(item.precio * item.cantidad)}</td>
            </tr>
          ))}
          <tr className="border-t border-border font-bold">
            <td colSpan={2} className="py-2 text-right text-foreground">TOTAL:</td>
            <td className="py-2 text-right text-primary-700 dark:text-primary-400">{formatearPrecio(pedido.total)}</td>
          </tr>
        </tbody>
      </table>

      {pedido.notas && (
        <p className="text-sm text-muted-foreground mt-2">📝 Nota: {pedido.notas}</p>
      )}
    </div>
  );
}

function EstadoSelector({ pedidoId, currentEstado }: {
  pedidoId: string;
  currentEstado: string;
}) {
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoEstado = e.target.value;
    await fetch(`/api/admin/pedidos/${pedidoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    window.location.reload();
  };

  return (
      <select
      defaultValue={currentEstado}
      onChange={handleChange}
      className="text-sm border border-border rounded-lg px-2 py-1 bg-input"
    >
      {estadoOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
