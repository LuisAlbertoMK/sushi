"use client";
// src/app/(public)/pedidos/track/page.tsx — Tracking de pedido por número
// confidence: high
import { Suspense, FormEvent, useState } from "react";

async function trackPedido(numero: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/pedidos/track?numero=${numero}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 404) return { error: "Pedido no encontrado" };
    return { error: "Error al buscar" };
  }
  return res.json();
}

export default function TrackPage({
  searchParams,
}: {
  searchParams: { numero?: string };
}) {
  const numero = searchParams.numero;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-red-700 mb-2">📍 Seguimiento de pedido</h1>
      <p className="text-gray-600">Ingresá tu número de pedido para ver el estado</p>

      <form action="/pedidos/track" className="flex gap-3 mt-4">
        <input
          type="text"
          name="numero"
          placeholder="PED-200814-1234"
          className="flex-1 px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="submit"
          className="bg-red-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-800 transition"
        >
          Buscar
        </button>
      </form>

      {numero && (
        <Suspense fallback={<p>Buscando pedido...</p>}>
          <PedidoDetalle numero={numero} />
        </Suspense>
      )}
    </div>
  );
}

async function PedidoDetalle({ numero }: { numero: string }) {
  const data = await trackPedido(numero);

  if (data.error) {
    return <p className="text-red-600">{data.error}</p>;
  }

  const estadoLabels: Record<string, string> = {
    PENDIENTE: "⏳ En espera",
    EN_COCINA: "👨‍🍳 En cocina",
    LISTO: "✅ Listo para retirar",
    ENTREGADO: "🏠 Entregado",
    CANCELADO: "❌ Cancelado",
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Pedido {data.numero}</h2>
        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
          {estadoLabels[data.estado] || data.estado}
        </span>
      </div>

      <p className="text-lg font-bold text-right mb-4">TOTAL: ${data.total.toFixed(2)}</p>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="pb-2">Producto</th>
            <th className="pb-2 text-center">Cant.</th>
            <th className="pb-2 text-right">Precio</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item: any, i: number) => (
            <tr key={i} className="border-t">
              <td className="py-2">{item.nombre}</td>
              <td className="py-2 text-center">{item.cantidad}</td>
              <td className="py-2 text-right">${(item.precio * item.cantidad).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-gray-600 mt-4">
        Pedido creado: {new Date(data.createdAt).toLocaleString("es-AR")}
      </p>
    </div>
  );
}
