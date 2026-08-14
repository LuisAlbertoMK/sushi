// src/app/api/productos/route.ts
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET público → productos disponibles, opcionalmente filtrados por categoriaId
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoriaId = searchParams.get("categoriaId");
  const where = categoriaId
    ? { categoriaId, disponible: true }
    : { disponible: true };
  const productos = await db.producto.findMany({
    where,
    include: { categoria: true },
    orderBy: [{ categoria: { orden: "asc" } }, { orden: "asc" }, { nombre: "asc" }],
  });
  return NextResponse.json(productos);
}
