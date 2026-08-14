// src/app/api/admin/promos/route.ts
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";
import { promocionSchema } from "@/lib/validations";

// GET → todas las promociones (admin)
export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const promos = await db.promocion.findMany({
    orderBy: [{ activa: "desc" }, { fechaInicio: "desc" }],
  });
  return NextResponse.json(promos);
}

// POST → crear promoción
export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const parsed = promocionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.errors },
      { status: 400 }
    );
  }

  const data = {
    ...parsed.data,
    fechaInicio: new Date(parsed.data.fechaInicio),
    fechaFin: new Date(parsed.data.fechaFin),
    valor: parsed.data.valor ?? undefined,
  };

  const promo = await db.promocion.create({ data });
  return NextResponse.json(promo, { status: 201 });
}
