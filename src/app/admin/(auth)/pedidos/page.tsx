// src/app/(admin)/pedidos/page.tsx — Lista de pedidos con cambio de estado
// confidence: high
import { db } from "@/lib/db";
import { formatearPrecio } from "@/lib/utils";
import { PedidoWithItems } from "@/lib/types";

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
        <h1 className="text-3xl font-bold text-gray-800">🛒 Pedidos</h1>
        <p className="text-gray-500">{pedidos.length} pedidos en total</p>
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
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{pedido.numero}</h2>
          <p className="text-sm text-gray-500">
            {pedido.nombre} · {pedido.email} · {pedido.telefono}
          </p>
          <p className="text-xs text-gray-400">
            Creado: {new Date(pedido.createdAt).toLocaleString("es-AR")}
          </p>
        </div>
        <EstadoSelector pedidoId={pedido.id} currentEstado={pedido.estado} />
      </div>

      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
          pedido.estado === "PENDIENTE" ? "bg-yellow-100 text-yellow-800" :
          pedido.estado === "EN_COCINA" ? "bg-orange-100 text-orange-800" :
          pedido.estado === "LISTO" ? "bg-blue-100 text-blue-800" :
          pedido.estado === "ENTREGADO" ? "bg-green-100 text-green-800" :
          "bg-red-100 text-red-800"
        }`}>
          {estadoLabels[pedido.estado] || pedido.estado}
        </span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-1">Producto</th>
            <th className="pb-1 text-center">Cant.</th>
            <th className="pb-1 text-right">Precio</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="py-1">{item.producto.nombre}{item.notas ? ` (${item.notas})` : ""}</td>
              <td className="py-1 text-center">{item.cantidad}</td>
              <td className="py-1 text-right">{formatearPrecio(item.precio * item.cantidad)}</td>
            </tr>
          ))}
          <tr className="border-t font-bold">
            <td colSpan={2} className="py-2 text-right">TOTAL:</td>
            <td className="py-2 text-right text-red-700">{formatearPrecio(pedido.total)}</td>
          </tr>
        </tbody>
      </table>

      {pedido.notas && (
        <p className="text-sm text-gray-600 mt-2">📝 Nota: {pedido.notas}</p>
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
      className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white"
    >
      {estadoOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
