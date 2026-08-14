// src/app/api/promos/route.ts
// confidence: high
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET público → promociones y publicaciones activas vigentes
export async function GET() {
  const now = new Date();
  const promos = await db.promocion.findMany({
    where: {
      activa: true,
      fechaInicio: { lte: now },
      fechaFin: { gte: now },
    },
    orderBy: { fechaInicio: "desc" },
  });
  const publicaciones = await db.publicacion.findMany({
    where: { publicada: true },
    orderBy: { fechaPublica: "desc" },
    take: 6,
  });
  return NextResponse.json({ promos, publicaciones });
}
