// src/app/api/admin/categorias/[id]/route.ts
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";
import { categoriaSchema } from "@/lib/validations";

// PATCH → actualizar categoría
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const parsed = categoriaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.errors },
      { status: 400 }
    );
  }

  try {
    const categoria = await db.categoria.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(categoria);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "El nombre ya existe" }, { status: 409 });
    }
    throw error;
  }
}

// DELETE → borrar categoría
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  try {
    await db.categoria.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }
    throw error;
  }
}
