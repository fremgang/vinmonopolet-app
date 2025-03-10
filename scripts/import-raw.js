// import-data.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function importData() {
  try {
    console.log('Reading products data...');
    const data = JSON.parse(fs.readFileSync('products.json', 'utf8')).products;
    
    console.log(`Found ${data.length} products to import...`);
    
    // Clean up the existing data first
    console.log('Cleaning up existing data...');
    await prisma.products.deleteMany({});
    
    // Insert data in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      console.log(`Importing batch ${i / batchSize + 1} of ${Math.ceil(data.length / batchSize)}...`);
      
      await prisma.products.createMany({
        data: batch.map(product => ({
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
        })),
        skipDuplicates: true,
      });
    }
    
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();