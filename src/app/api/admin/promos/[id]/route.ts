// src/app/api/admin/promos/[id]/route.ts
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";
import { promocionSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const parsed = promocionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.errors },
      { status: 400 }
    );
  }

  const data: any = {
    titulo: parsed.data.titulo,
    descripcion: parsed.data.descripcion,
    imagen: parsed.data.imagen,
    tipo: parsed.data.tipo,
    valor: parsed.data.valor,
    codigo: parsed.data.codigo,
    fechaInicio: new Date(parsed.data.fechaInicio),
    fechaFin: new Date(parsed.data.fechaFin),
    activa: parsed.data.activa,
  };

  try {
    const promo = await db.promocion.update({
      where: { id },
      data,
    });
    return NextResponse.json(promo);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "El código ya existe" }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  try {
    await db.promocion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 });
    }
    throw error;
  }
}
