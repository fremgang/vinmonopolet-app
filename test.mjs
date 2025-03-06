// test.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function test() {
  try {
    const count = await prisma.products.count();
    console.log('Total products:', count);
    const sample = await prisma.products.findMany({ take: 5 });
    console.log('Sample:', sample);
  } catch (error) {
    console.error('Prisma error:', error);
  } finally {
    await prisma.$disconnect();
  }
}
test();