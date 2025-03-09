// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client/edge';
import { withOptimize } from '@prisma/extension-optimize';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY })).$extends(withAccelerate())

export { prisma };
