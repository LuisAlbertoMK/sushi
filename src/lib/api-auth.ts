// src/lib/api-auth.ts — Helper para verificar auth en API routes
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { decodeSession, SessionUser } from "@/lib/auth";

// Verifica el token de auth desde cookies en request
// Usado en rutas API admin para proteger endpoints
export async function getAuthUser(
  request: NextRequest
): Promise<{ ok: true; user: SessionUser } | { ok: false; response: NextResponse }> {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      ),
    };
  }

  const user = await decodeSession(token);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "No tienes permisos de administrador" },
        { status: 403 }
      ),
    };
  }

  return { ok: true, user };
}

// Alias genérico para usar en las rutas admin
export const getCategoriaFromRequest = getAuthUser;
