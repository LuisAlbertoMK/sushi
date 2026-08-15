"use client";
// src/app/(public)/pedidos/track/page.tsx — Tracking de pedido por número
// confidence: high
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PedidoStepper } from "@/components/ui/PedidoStepper";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatearPrecio } from "@/lib/utils";

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

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto space-y-8" aria-busy="true" />}>
      <TrackContent />
    </Suspense>
  );
}

function TrackContent() {
  const searchParams = useSearchParams();
  const numero = searchParams.get("numero") || undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="font-display text-3xl font-bold text-primary-700 mb-2">📍 Seguimiento de pedido</h1>
      <p className="text-muted-foreground">Ingresá tu número de pedido para ver el estado</p>

      <form action="/pedidos/track" className="flex gap-3 mt-4">
        <input
          type="text"
          name="numero"
          placeholder="PED-200814-1234"
          className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
        />
        <button
          type="submit"
          className="bg-primary-700 dark:bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-800 dark:hover:bg-primary-500 transition focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Buscar
        </button>
      </form>

      {numero && (
        <Suspense fallback={<p className="text-muted-foreground">Buscando pedido...</p>}>
          <PedidoDetalle numero={numero} />
        </Suspense>
      )}
    </div>
  );
}

async function PedidoDetalle({ numero }: { numero: string }) {
  const data = await trackPedido(numero);

  if (data.error) {
    return <EmptyState type="search" title={data.error} />;
  }

  return (
    <div className="bg-card rounded-xl shadow-md p-6 border border-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Pedido {data.numero}</h2>
      </div>

      {/* Stepper timeline visual */}
      <PedidoStepper
        estado={data.estado}
        createdAt={data.createdAt}
        updatedAt={data.updatedAt}
      />

      <p className="text-lg font-bold text-right mb-2">TOTAL: {formatearPrecio(data.total)}</p>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="pb-2">Producto</th>
            <th className="pb-2 text-center">Cant.</th>
            <th className="pb-2 text-right">Precio</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item: any, i: number) => (
            <tr key={i} className="border-t border-border">
              <td className="py-2">{item.nombre}</td>
              <td className="py-2 text-center">{item.cantidad}</td>
              <td className="py-2 text-right">{formatearPrecio(item.precio * item.cantidad)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-muted-foreground/80 mt-4">
        Pedido creado: {new Date(data.createdAt).toLocaleString("es-AR")}
      </p>
    </div>
  );
}
