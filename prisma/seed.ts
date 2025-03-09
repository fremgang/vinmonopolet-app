// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient()

async function main() {
  // Check if we have sample data to seed
  try {
    // Check if products.json exists
    const productsFile = path.join(process.cwd(), 'products.json');
    
    if (fs.existsSync(productsFile)) {
      console.log('Found products.json file. Seeding from file...');
      const data = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
      
      if (data && data.products && Array.isArray(data.products)) {
        const count = await prisma.products.count();
        
        if (count === 0) {
          console.log(`Importing ${data.products.length} products from JSON...`);
          
          // Import a limited number for testing if needed
          const productsToImport = data.products.slice(0, 10);
          
          for (const product of productsToImport) {
            await prisma.products.create({
              data: product
            });
          }
          
          console.log('Seed completed successfully!');
        } else {
          console.log('Database already contains data. Skipping seed.');
        }
      } else {
        console.log('Invalid products.json format. Skipping seed.');
      }
    } else {
      console.log('No products.json file found. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });