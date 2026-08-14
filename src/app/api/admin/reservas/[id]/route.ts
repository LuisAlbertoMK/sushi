// src/app/api/admin/reservas/[id]/route.ts
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

// PATCH → cambiar estado de reserva
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const { estado, mesa } = body;

  const validEstados = ["PENDIENTE", "CONFIRMADA", "CANCELADA", "COMPLETADA"];
  if (!validEstados.includes(estado)) {
    return NextResponse.json(
      { error: `Estado inválido. Debe ser: ${validEstados.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const data: any = { estado };
    if (mesa !== undefined) data.mesa = mesa;
    const reserva = await db.reservacion.update({
      where: { id },
      data,
    });
    return NextResponse.json(reserva);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }
    throw error;
  }
}

// DELETE → borrar reserva
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  try {
    await db.reservacion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }
    throw error;
  }
}
