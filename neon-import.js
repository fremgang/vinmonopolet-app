// neon-import.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

// Use direct connection for bulk operations
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
    const productsFile = 'products.json';
    
    if (!fs.existsSync(productsFile)) {
      console.error(`File ${productsFile} not found!`);
      return;
    }
    
    const data = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    
    if (!data.products || !Array.isArray(data.products)) {
      console.error('Invalid data format: expected { products: [] }');
      return;
    }
    
    const products = data.products;
    console.log(`Found ${products.length} products to import...`);
    
    // Count existing products
    const existingCount = await prisma.products.count();
    console.log(`Currently ${existingCount} products in database.`);
    
    if (existingCount > 0) {
      console.log('Do you want to delete existing products? (y/n)');
      // Simple synchronous input for Node.js scripts
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('> ', resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() === 'y') {
        console.log('Cleaning up existing data...');
        await prisma.products.deleteMany({});
        console.log('Existing data deleted.');
      } else {
        console.log('Keeping existing data and adding new products...');
      }
    }
    
    // Insert data in smaller batches for Neon
    const batchSize = 50;
    let imported = 0;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      console.log(`Importing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(products.length / batchSize)}...`);
      
      try {
        // Use transaction to ensure data consistency
        await prisma.$transaction(async (tx) => {
          for (const product of batch) {
            // Make sure the product_id is provided
            if (!product.product_id) {
              console.warn('Skipping product without ID');
              continue;
            }
            
            // Try to create the product or skip if it exists
            try {
              await tx.products.upsert({
                where: { product_id: product.product_id },
                update: {}, // Don't update if exists
                create: {
                  product_id: product.product_id,
                  name: product.name || '',
                  category: product.category,
                  price: typeof product.price === 'number' ? product.price : null,
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
                  imageSmall: product.imageSmall || `https://bilder.vinmonopolet.no/cache/300x300-0/${product.product_id}-1.jpg`,
                  imageMain: product.imageMain || `https://bilder.vinmonopolet.no/cache/515x515-0/${product.product_id}-1.jpg`,
                },
              });
              imported++;
            } catch (error) {
              console.error(`Error importing product ${product.product_id}:`, error);
            }
          }
        });
      } catch (txError) {
        console.error(`Error in transaction batch ${Math.floor(i / batchSize) + 1}:`, txError);
      }
      
      // Small delay between batches to allow Neon to process
      console.log(`Imported ${imported} products so far...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Import completed successfully! Imported ${imported} products.`);
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();