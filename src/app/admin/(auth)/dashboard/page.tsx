// src/app/(admin)/dashboard/page.tsx — Dashboard con métricas
// confidence: high
import { db } from "@/lib/db";
import { formatearPrecio } from "@/lib/utils";
import { redirect } from "next/navigation";

async function getDatosDashboard() {
  const now = new Date();
  // Pedidos del día
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [pedidosHoy, ventasHoy, reservasPendientes, productosTotal, categoriasTotal] =
    await Promise.all([
      db.pedido.count({
        where: { createdAt: { gte: startOfDay } },
      }),
      db.pedido.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startOfDay },
          estado: { not: "CANCELADO" },
        },
      }),
      db.reservacion.count({
        where: { estado: "CONFIRMADA", fecha: { gte: startOfDay } },
      }),
      db.producto.count(),
      db.categoria.count(),
    ]);

  // Últimos 5 pedidos
  const ultimosPedidos = await db.pedido.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      numero: true,
      estado: true,
      total: true,
      createdAt: true,
    },
  });

  return {
    pedidosHoy,
    ventasHoy: ventasHoy._sum.total || 0,
    reservasPendientes,
    productosTotal,
    categoriasTotal,
    ultimosPedidos,
  };
}

const estadoLabels: Record<string, string> = {
  PENDIENTE: "⏳ En espera",
  EN_COCINA: "👨‍🍳 En cocina",
  LISTO: "✅ Listo",
  ENTREGADO: "🏠 Entregado",
  CANCELADO: "❌ Cancelado",
};

export default async function DashboardPage() {
  const data = await getDatosDashboard();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard</h1>
        <p className="text-gray-600">Resumen de Sushi Bar</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <div className="text-3xl mb-2">🛒</div>
          <p className="text-2xl font-bold text-gray-800">{data.pedidosHoy}</p>
          <p className="text-sm text-gray-600">Pedidos hoy</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <div className="text-3xl mb-2">💰</div>
          <p className="text-2xl font-bold text-green-600">{formatearPrecio(data.ventasHoy)}</p>
          <p className="text-sm text-gray-600">Ventas hoy</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <div className="text-3xl mb-2">📅</div>
          <p className="text-2xl font-bold text-red-700">{data.reservasPendientes}</p>
          <p className="text-sm text-gray-600">Reservas hoy</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <div className="text-3xl mb-2">🍣</div>
          <p className="text-2xl font-bold text-gray-800">{data.productosTotal}</p>
          <p className="text-sm text-gray-600">Productos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-2xl font-bold text-gray-800">{data.categoriasTotal}</p>
          <p className="text-sm text-gray-600">Categorías</p>
        </div>
      </div>

      {/* Últimos pedidos */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Últimos pedidos</h2>
        {data.ultimosPedidos.length === 0 ? (
          <p className="text-gray-600 py-4">No hay pedidos todavía</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="pb-2">Número</th>
                <th className="pb-2">Estado</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data.ultimosPedidos.map((p) => (
                <tr key={p.numero} className="border-t">
                  <td className="py-2 font-mono">{p.numero}</td>
                  <td className="py-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                      {estadoLabels[p.estado] || p.estado}
                    </span>
                  </td>
                  <td className="py-2">{formatearPrecio(p.total)}</td>
                  <td className="py-2 text-gray-600">
                    {new Date(p.createdAt).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
