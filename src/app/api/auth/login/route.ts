// src/app/api/auth/login/route.ts
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, encodeSession, setAuthCookie, isAuthSecretConfigured } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y password son requeridos" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email as string },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password as string, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: user.id,
      email: user.email!,
      name: user.name,
      role: user.role,
    };
    const signed = encodeSession(sessionUser);

    const response = NextResponse.json({ success: true, user: sessionUser });
    setAuthCookie(sessionUser, response);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    // Configuración ausente en producción: mensaje explícito en vez de un 500 opaco
    if (!isAuthSecretConfigured()) {
      return NextResponse.json(
        { error: "El servidor no tiene NEXTAUTH_SECRET configurado: el login está deshabilitado." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
