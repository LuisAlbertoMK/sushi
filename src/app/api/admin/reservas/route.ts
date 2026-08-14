// src/app/api/admin/reservas/route.ts
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

// GET → todas las reservas (admin)
export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const reservas = await db.reservacion.findMany({
    orderBy: { fecha: "desc" },
  });
  return NextResponse.json(reservas);
}
