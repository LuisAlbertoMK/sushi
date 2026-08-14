// src/app/api/admin/categorias/route.ts
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";
import { categoriaSchema } from "@/lib/validations";

// GET → todas las categorías (admin, incluye orden)
export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const categorias = await db.categoria.findMany({
    include: { productos: { select: { id: true, nombre: true } } },
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
  });
  return NextResponse.json(categorias);
}

// POST → crear categoría
export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const parsed = categoriaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.errors },
      { status: 400 }
    );
  }

  try {
    const categoria = await db.categoria.create({ data: parsed.data });
    return NextResponse.json(categoria, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "La categoría ya existe" }, { status: 409 });
    }
    throw error;
  }
}
