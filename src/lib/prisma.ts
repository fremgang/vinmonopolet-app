// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

export function createPrismaClient() {
  return new PrismaClient().$extends(withAccelerate());
}

// Singleton to avoid too many client instances in development
const globalForPrisma = global as unknown as { prisma: ReturnType<typeof createPrismaClient> };
export const prisma = globalForPrisma.prisma || createPrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;