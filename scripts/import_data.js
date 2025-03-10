// import-data.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

// Use direct connection for bulk operations
// This uses the DIRECT_URL which is more suitable for migrations and imports
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function importData() {
  try {
    console.log('Reading products data...');
    const data = JSON.parse(fs.readFileSync('products.json', 'utf8')).products;
    
    console.log(`Found ${data.length} products to import...`);
    
    // Clean up the existing data first
    console.log('Cleaning up existing data...');
    await prisma.products.deleteMany({});
    
    // Insert data in smaller batches for Neon
    // Using smaller batch size due to Neon's serverless nature
    const batchSize = 50;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      console.log(`Importing batch ${i / batchSize + 1} of ${Math.ceil(data.length / batchSize)}...`);
      
      // Use transaction to ensure data consistency
      await prisma.$transaction(async (tx) => {
        for (const product of batch) {
          await tx.products.create({
            data: {
              product_id: product.product_id,
              name: product.name,
              category: product.category,
              price: product.price,
              country: product.country,
              district: product.district,
              sub_district: product.sub_district,
              producer: product.producer,
              varetype: product.varetype,
              lukt: product.lukt,
              smak: product.smak,
              farge: product.farge,
              metode: product.metode,
              inneholder: product.inneholder,
              emballasjetype: product.emballasjetype,
              korktype: product.korktype,
              utvalg: product.utvalg,
              grossist: product.grossist,
              transportor: product.transportor,
              imageSmall: `https://bilder.vinmonopolet.no/cache/300x300-0/${product.product_id}-1.jpg`,
              imageMain: `https://bilder.vinmonopolet.no/cache/515x515-0/${product.product_id}-1.jpg`,
            },
          });
        }
      });
      
      // Small delay between batches to allow Neon to process
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();