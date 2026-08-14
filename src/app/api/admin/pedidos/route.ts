// src/app/api/admin/pedidos/route.ts
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

// GET → todos los pedidos (admin)
export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado");

  const where = estado ? { estado: estado as any } : {};

  const pedidos = await db.pedido.findMany({
    where,
    include: {
      items: { include: { producto: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(pedidos);
}
