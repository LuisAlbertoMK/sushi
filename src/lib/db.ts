// src/lib/db.ts — Cliente Prisma singleton
// confidence: high

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

if (!global.prismaGlobal) {
  global.prismaGlobal = new PrismaClient();
}

export const db = global.prismaGlobal;
