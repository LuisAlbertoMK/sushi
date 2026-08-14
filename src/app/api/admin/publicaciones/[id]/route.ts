// src/app/api/admin/publicaciones/[id]/route.ts
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";
import { publicacionSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const parsed = publicacionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.errors },
      { status: 400 }
    );
  }

  try {
    const pub = await db.publicacion.update({
      where: { id },
      data: {
        titulo: parsed.data.titulo,
        contenido: parsed.data.contenido,
        imagen: parsed.data.imagen,
        publicada: parsed.data.publicada,
        fechaPublica: new Date(parsed.data.fechaPublica),
      },
    });
    return NextResponse.json(pub);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
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
    await db.publicacion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
    }
    throw error;
  }
}
