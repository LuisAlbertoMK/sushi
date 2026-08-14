// src/app/api/categorias/route.ts
// confidence: high
// GET → lista de categorías (activas, para el menú público)
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const categorias = await db.categoria.findMany({
    where: { activo: true },
    include: { productos: { where: { disponible: true } } },
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
  });
  return NextResponse.json(categorias);
}
