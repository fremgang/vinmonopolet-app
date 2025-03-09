// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { withPulse } from '@prisma/extension-pulse';

// Prevent multiple instances during development hot reloads
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize base client
const prismaBase = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Extend with Pulse
const prisma = prismaBase.$extends(
  withPulse({
    apiKey: process.env.PULSE_API_KEY as string,
  })
);

// Store in global object to prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') global.prisma = prismaBase;

export { prisma };