// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Prevent multiple instances during development hot reloads
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize client
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Store in global object to prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export { prisma };