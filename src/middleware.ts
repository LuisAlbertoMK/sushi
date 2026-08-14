// src/middleware.ts — Protege rutas /admin
// confidence: high
//
// Next.js middleware: corre antes de cada request en el edge.
// Si el usuario no tiene cookie de auth válida con rol ADMIN → redirect a /admin/login.

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger todo bajo /admin (excepto /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const result = await requireAdmin(request);
    if (result.redirect) {
      return result.response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
