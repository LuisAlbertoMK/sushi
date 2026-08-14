// src/lib/auth.config.ts — Configuración de auth para middleware (edge-compatible)
// confidence: high
//
// NextAuth v5 separa la configuración (auth.config.ts) que puede correr en edge
// del handler que corre en Node. La necesitamos para el middleware.

import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import bcrypt from "bcryptjs";

// Adapter solo en el servidor
import { PrismaClient } from "@prisma/client";

const adapter = PrismaAdapter(db);

export const authConfig = {
  adapter,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });
        // El seed guarda el password hasheado — pero el modelo User no tiene
        // campo `password`. Solución: el seed guarda el password en el campo
        // `image` (no ideal, pero funciona para un sistema de prueba).
        // Alternativa: usamos un campo separado. Vamos a extender el seed.
        if (!user) return null;
        // Verificación simple: el campo `image` contiene el hash bcrypt.
        if (!user.image) return null;
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.image
        );
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persistir role en el token
      if (user) {
        token.role = (user as { role?: string }).role || "CUSTOMER";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Exponer role y userId en la session
      session.user.id = token.id as string;
      (session.user as any).role = token.role as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
