// export-sqlite.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

// Create a temporary schema.prisma file specifically for SQLite export
const tempSchemaContent = `
datasource db {
  provider = "sqlite"
  url      = "file:./products.db"
}

generator client {
  provider = "prisma-client-js"
  output   = "./temp-client"
}

model products {
  product_id     String  @id @default(uuid())
  name           String
  category       String?
  country        String?
  price          Int?
  district       String?
  sub_district   String?
  producer       String?
  varetype       String?
  lukt           String?
  smak           String?
  farge          String?
  metode         String?
  inneholder     String?
  emballasjetype String?
  korktype       String?
  utvalg         String?
  grossist       String?
  transportor    String?
  imageSmall     String?
  imageMain      String?
}
`;

// Write the temporary schema file
fs.writeFileSync('temp-schema.prisma', tempSchemaContent);

// Run a command to generate the Prisma client based on this temp schema
import { execSync } from 'child_process';
console.log('Generating temporary Prisma client for SQLite export...');
try {
  execSync('npx prisma generate --schema=temp-schema.prisma', { stdio: 'inherit' });
} catch (error) {
  console.error('Error generating Prisma client:', error);
  process.exit(1);
}

// Now use vanilla SQLite to extract data
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function exportData() {
  try {
    console.log('Opening SQLite database...');
    const db = await open({
      filename: 'products.db',
      driver: sqlite3.Database
    });

    console.log('Fetching products from SQLite...');
    const products = await db.all('SELECT * FROM products');
    
    console.log(`Found ${products.length} products. Exporting to JSON...`);
    fs.writeFileSync('products.json', JSON.stringify({ products }, null, 2));
    
    console.log('Export completed successfully!');
    
    // Clean up temporary files
    console.log('Cleaning up temporary files...');
    try {
      fs.unlinkSync('temp-schema.prisma');
    } catch (err) {
      console.warn('Warning: Could not delete temp-schema.prisma', err);
    }

  } catch (error) {
    console.error('Error exporting data:', error);
  }
}

exportData();