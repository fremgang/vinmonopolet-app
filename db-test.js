// db-test.mjs
// Simple script to verify database connection

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    
    // Try to get a count of products
    const count = await prisma.products.count();
    console.log(`✅ Connection successful! Found ${count} products.`);
    
    // Get a small sample of products
    if (count > 0) {
      const sample = await prisma.products.findMany({ take: 3 });
      console.log('Sample products:');
      console.log(JSON.stringify(sample, null, 2));
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then(success => {
    console.log(success ? '✅ Test completed successfully' : '❌ Test failed');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });