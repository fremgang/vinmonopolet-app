// fix-migration.ts
// Run this script to update the database schema to support higher prices

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function fixDatabaseMigration() {
  try {
    console.log('Starting database migration fix...');
    
    // 1. Check the current DB setup
    console.log('Checking current database setup...');
    const rawProducts = await prisma.$queryRaw`
      SELECT column_name, data_type, numeric_precision
      FROM information_schema.columns
      WHERE table_name = 'products' AND column_name = 'price'
    `;
    console.log('Current price column configuration:', rawProducts);
    
    // 2. Create a backup first
    console.log('Creating backup of products table...');
    try {
      await prisma.$executeRaw`CREATE TABLE products_backup AS SELECT * FROM products`;
      console.log('Backup created successfully.');
    } catch (err) {
      console.log('Backup may already exist, continuing...');
    }
    
    // 3. Get price statistics before changes
    console.log('Getting current price statistics...');
    const priceStats = await prisma.$queryRaw`
      SELECT 
        MIN(price) as min_price, 
        MAX(price) as max_price, 
        AVG(price) as avg_price,
        COUNT(*) as total_count,
        SUM(CASE WHEN price IS NULL THEN 1 ELSE 0 END) as null_count
      FROM products
    `;
    console.log('Current price statistics:', priceStats);
    
    // 4. Now modify the column to support higher values
    console.log('Modifying price column to use BIGINT...');
    await prisma.$executeRaw`ALTER TABLE products ALTER COLUMN price TYPE BIGINT`;
    console.log('Column type changed successfully.');
    
    // 5. Create or update indexes for performance
    console.log('Creating/updating price index...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS products_price_idx ON products(price)
    `;
    console.log('Index created successfully.');
    
    // 6. Check post-change statistics
    console.log('Getting updated price statistics...');
    const updatedStats = await prisma.$queryRaw`
      SELECT 
        MIN(price) as min_price, 
        MAX(price) as max_price, 
        AVG(price) as avg_price,
        COUNT(*) as total_count,
        SUM(CASE WHEN price IS NULL THEN 1 ELSE 0 END) as null_count
      FROM products
    `;
    console.log('Updated price statistics:', updatedStats);
    
    // 7. Create a new migration file
    console.log('Creating migration file...');
    const migrationContent = `-- CreateMigration
-- Name: fix_price_column_type
-- Description: Update price column to use BIGINT instead of INTEGER

-- Step 1: Alter the column type
ALTER TABLE products ALTER COLUMN price TYPE BIGINT;

-- Step 2: Create/update index
CREATE INDEX IF NOT EXISTS products_price_idx ON products(price);
`;
    
    const migrationDir = path.join(process.cwd(), 'prisma', 'migrations', 'fix_price_column');
    const migrationFilePath = path.join(migrationDir, 'migration.sql');
    
    try {
      await fs.mkdir(migrationDir, { recursive: true });
      await fs.writeFile(migrationFilePath, migrationContent);
      console.log(`Migration file created at ${migrationFilePath}`);
    } catch (err) {
      console.error('Error creating migration file:', err);
    }
    
    console.log('Migration fix complete!');
    
  } catch (error) {
    console.error('Error during migration fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabaseMigration().catch(console.error);