// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate())


// Store in global object to prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export { prisma };