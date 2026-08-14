// src/app/api/admin/pedidos/[id]/route.ts
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

// PATCH → cambiar estado del pedido
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const { estado } = body;

  const validEstados = ["PENDIENTE", "EN_COCINA", "LISTO", "ENTREGADO", "CANCELADO"];
  if (!validEstados.includes(estado)) {
    return NextResponse.json(
      { error: `Estado inválido. Debe ser: ${validEstados.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const pedido = await db.pedido.update({
      where: { id },
      data: { estado },
      include: { items: { include: { producto: true } } },
    });
    return NextResponse.json(pedido);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }
    throw error;
  }
}

// GET → detalle de pedido (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const pedido = await db.pedido.findUnique({
    where: { id },
    include: { items: { include: { producto: true } } },
  });

  if (!pedido) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }
  return NextResponse.json(pedido);
}
