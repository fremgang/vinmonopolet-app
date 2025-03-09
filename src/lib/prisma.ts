// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// Initialize client with Accelerate extension
const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate());
};

// Prevent multiple instances during development hot reloads
declare global {
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

// Initialize client
const prisma = global.prisma || prismaClientSingleton();

// Store in global object to prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export { prisma };