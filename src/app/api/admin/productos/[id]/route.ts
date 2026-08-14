// src/app/api/admin/productos/[id]/route.ts
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";
import { productoSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const parsed = productoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.errors },
      { status: 400 }
    );
  }

  const categoria = await db.categoria.findUnique({
    where: { id: parsed.data.categoriaId },
  });
  if (!categoria) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
  }

  try {
    const producto = await db.producto.update({
      where: { id },
      data: {
        nombre: parsed.data.nombre,
        descripcion: parsed.data.descripcion,
        precio: parsed.data.precio,
        categoriaId: parsed.data.categoriaId,
        imagen: parsed.data.imagen,
        disponible: parsed.data.disponible,
      },
    });
    return NextResponse.json(producto);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
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
    await db.producto.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    throw error;
  }
}
