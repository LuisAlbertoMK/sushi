// src/app/api/admin/publicaciones/route.ts
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";
import { publicacionSchema } from "@/lib/validations";

// GET → todas las publicaciones (admin)
export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const publicaciones = await db.publicacion.findMany({
    orderBy: { fechaPublica: "desc" },
  });
  return NextResponse.json(publicaciones);
}

// POST → crear publicación
export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const parsed = publicacionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.errors },
      { status: 400 }
    );
  }

  const data = {
    titulo: parsed.data.titulo,
    contenido: parsed.data.contenido,
    imagen: parsed.data.imagen,
    publicada: parsed.data.publicada,
    fechaPublica: new Date(parsed.data.fechaPublica),
  };

  const pub = await db.publicacion.create({ data });
  return NextResponse.json(pub, { status: 201 });
}
