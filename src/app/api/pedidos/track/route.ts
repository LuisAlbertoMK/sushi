// src/app/api/pedidos/track/route.ts
// confidence: high
// GET público → buscar pedido por número (para tracking)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const numero = searchParams.get("numero");

  if (!numero) {
    return NextResponse.json(
      { error: "Número de pedido requerido" },
      { status: 400 }
    );
  }

  const pedido = await db.pedido.findUnique({
    where: { numero },
    include: {
      items: { include: { producto: true } },
    },
  });

  if (!pedido) {
    return NextResponse.json(
      { error: "Pedido no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: pedido.id,
    numero: pedido.numero,
    estado: pedido.estado,
    total: pedido.total,
    notas: pedido.notas,
    createdAt: pedido.createdAt,
    items: pedido.items.map((item) => ({
      nombre: item.producto.nombre,
      cantidad: item.cantidad,
      precio: item.precio,
      notas: item.notas,
    })),
  });
}
