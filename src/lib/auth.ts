// src/lib/auth.ts — Auth con cookies firmadas (HMAC-SHA256 nativo de Node)
// confidence: high
//
// NO depende de NextAuth v5 (beta) ni jose. Usa:
// - bcryptjs (ya instalado) para hashear passwords
// - Node crypto (built-in) para firmar/verify cookies HMAC-SHA256
// - next/headers cookies (built-in de Next.js)
//
// El modelo User necesita `password String?` — el schema ya lo tiene (agregado).

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET || "sushi-dev-secret-change-in-production-1234567890";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "ADMIN";
}

// Hashear password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verificar password
export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

// Firmar un payload → string base64.signature
function sign(payload: string): string {
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

// Verificar y extraer payload
function verify(signed: string): string | null {
  const [payload, sig] = signed.split(".");
  if (!payload || !sig) return null;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");
  // timing-safe comparison
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return payload;
}

// Codificar usuario → cookie value
export function encodeSession(user: SessionUser): string {
  const json = Buffer.from(JSON.stringify(user)).toString("base64url");
  return sign(json);
}

// Decodificar cookie → usuario
export async function decodeSession(
  signed: string
): Promise<SessionUser | null> {
  const payload = verify(signed);
  if (!payload) return null;
  try {
    const json = Buffer.from(payload, "base64url").toString("utf-8");
    return JSON.parse(json) as SessionUser;
  } catch {
    return null;
  }
}

// Obtener usuario de la sesión (server-side, en server components)
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;
  return decodeSession(token);
}

// Set cookie de auth (usado en API routes / server actions)
export function setAuthCookie(
  user: SessionUser,
  response: NextResponse
) {
  const signed = encodeSession(user);
  response.cookies.set("auth-token", signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: "/",
    sameSite: "lax",
  });
}

// Clear cookie de auth
export function clearAuthCookie(response: NextResponse) {
  response.cookies.delete("auth-token");
}

// Middleware helper: requiere rol admin. Usado en middleware.ts
export async function requireAdmin(
  request: NextRequest
): Promise<{ redirect: true; response: NextResponse } | { redirect: false }> {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    if (request.nextUrl.pathname !== "/admin/login") {
      url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    }
    return { redirect: true, response: NextResponse.redirect(url) };
  }

  const user = await decodeSession(token);
  if (!user || user.role !== "ADMIN") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return { redirect: true, response: NextResponse.redirect(url) };
  }

  return { redirect: false };
}

export { SECRET };
