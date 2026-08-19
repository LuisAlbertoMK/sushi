// src/app/api/reservas/route.ts
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reservaSchema } from "@/lib/validations";

// POST público → crear reserva
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = reservaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const fecha = new Date(parsed.data.fecha);
    if (isNaN(fecha.getTime())) {
      return NextResponse.json(
        { error: "Fecha inválida" },
        { status: 400 }
      );
    }

    const reserva = await db.reservacion.create({
      data: {
        nombre: parsed.data.nombre,
        email: parsed.data.email,
        telefono: parsed.data.telefono || undefined,
        fecha,
        personas: parsed.data.personas,
        notas: parsed.data.notas || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      reserva: {
        id: reserva.id,
        estado: reserva.estado,
        fecha: reserva.fecha,
        personas: reserva.personas,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error creando reserva:", error);
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
