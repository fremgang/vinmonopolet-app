// direct-export.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

async function exportData() {
  try {
    console.log('Opening SQLite database...');
    const db = await open({
      filename: './prisma/products.db',
      driver: sqlite3.Database
    });

    console.log('Fetching products from SQLite...');
    const products = await db.all('SELECT * FROM products');
    
    console.log(`Found ${products.length} products. Exporting to JSON...`);
    fs.writeFileSync('products.json', JSON.stringify({ products }, null, 2));
    
    console.log('Export completed successfully!');
    
    // Close the database
    await db.close();
  } catch (error) {
    console.error('Error exporting data:', error);
  }
}

exportData();