// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withOptimize()).$extends(withAccelerate())

export { prisma };

function withOptimize() {
    const extension = (client: any) => client;
    extension.$extends = { extArgs: {} };
    return extension;
}
