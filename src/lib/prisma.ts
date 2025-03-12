// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create prisma client with proper configuration for Neon + Accelerate
export const prisma = globalForPrisma.prisma || 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Add connection pooling configuration
    datasources: {
      db: {
        url: process.env.DATABASE_URL || '',
      },
    },
    // Add query timeout configuration
    transactionOptions: {
      maxWait: 30000, // 30 seconds max wait time
      timeout: 30000, // 30 seconds timeout
    },
  }).$extends(withAccelerate());

// Use in development only
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;