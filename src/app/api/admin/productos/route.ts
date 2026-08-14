// src/app/api/admin/productos/route.ts
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";
import { productoSchema } from "@/lib/validations";

// GET → todos los productos (admin)
export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const productos = await db.producto.findMany({
    include: { categoria: { select: { nombre: true } } },
    orderBy: [{ categoria: { orden: "asc" } }, { orden: "asc" }],
  });
  return NextResponse.json(productos);
}

// POST → crear producto
export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const parsed = productoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.errors },
      { status: 400 }
    );
  }

  // Verificar categoria existe
  const categoria = await db.categoria.findUnique({
    where: { id: parsed.data.categoriaId },
  });
  if (!categoria) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
  }

  const producto = await db.producto.create({
    data: {
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion,
      precio: parsed.data.precio,
      categoriaId: parsed.data.categoriaId,
      imagen: parsed.data.imagen,
      disponible: parsed.data.disponible,
    },
  });
  return NextResponse.json(producto, { status: 201 });
}
