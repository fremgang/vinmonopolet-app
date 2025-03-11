// csv-to-json-converter.js
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import readline from 'readline';
import path from 'path';

// Field names mapping based on CSV structure
const fieldNames = [
  'product_id',
  'name',
  'category',
  'price',
  'country',
  'district',
  'sub_district',
  'producer',
  'varetype',
  'lukt',
  'smak',
  'farge',
  'metode',
  'inneholder',
  'emballasjetype',
  'korktype',
  'utvalg',
  'grossist',
  'transportor'
];

// Parse Norwegian number format (space as thousand separator, comma as decimal)
function parseNorwegianNumber(str) {
  if (!str || str.trim() === '') return null;
  
  // Remove any non-numeric characters except spaces, commas and periods
  const cleaned = str.replace(/[^\d\s,.]/g, '').trim();
  
  // Replace comma with dot for decimal and remove spaces
  const normalized = cleaned.replace(/\s+/g, '').replace(',', '.');
  
  const number = parseFloat(normalized);
  return isNaN(number) ? null : number;
}

async function convertCsvToJson(inputFilePath, outputFilePath) {
  try {
    console.log(`Converting ${inputFilePath} to JSON...`);
    
    // Ensure input file exists
    try {
      await fs.access(inputFilePath);
    } catch (error) {
      console.error(`Input file not found: ${inputFilePath}`);
      return false;
    }
    
    // Create read stream and readline interface
    const fileStream = createReadStream(inputFilePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    const products = [];
    let lineCount = 0;
    
    // Process each line
    for await (const line of rl) {
      lineCount++;
      if (!line.trim()) continue; // Skip empty lines
      
      // Split by pipe character
      const fields = line.split('|');
      
      // Create product object
      const product = {};
      
      // Map fields to properties
      for (let i = 0; i < fieldNames.length && i < fields.length; i++) {
        const fieldName = fieldNames[i];
        const fieldValue = fields[i]?.trim() || '';
        
        // Special handling for price field - parse as number
        if (fieldName === 'price' && fieldValue) {
          product[fieldName] = parseNorwegianNumber(fieldValue);
        } else {
          // Regular string fields
          product[fieldName] = fieldValue || null;
        }
      }
      
      products.push(product);
    }
    
    console.log(`Processed ${lineCount} lines, found ${products.length} products`);
    
    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputFilePath);
    await fs.mkdir(outputDir, { recursive: true });
    
    // Write the JSON file
    await fs.writeFile(
      outputFilePath, 
      JSON.stringify({ products }, null, 2)
    );
    
    console.log(`Successfully converted to JSON: ${outputFilePath}`);
    
    // Quick price analysis
    const prices = products
      .map(p => p.price)
      .filter(price => price !== null);
    
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      
      console.log('Price analysis:');
      console.log(`- Min price: ${minPrice}`);
      console.log(`- Max price: ${maxPrice}`);
      console.log(`- Avg price: ${avgPrice.toFixed(2)}`);
      console.log(`- Products with prices: ${prices.length}/${products.length}`);
      
      // Check for high-value products
      const highValueProducts = products.filter(p => p.price && p.price > 50000);
      if (highValueProducts.length > 0) {
        console.log(`\nFound ${highValueProducts.length} high-value products (>50,000 NOK):`);
        highValueProducts.forEach(p => {
          console.log(`${p.product_id}: ${p.name} - ${p.price} NOK`);
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error converting CSV to JSON:', error);
    return false;
  }
}

// Run if script is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node csv-to-json-converter.js <input-csv-file> [output-json-file]');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1] || 'products.json';
  
  convertCsvToJson(inputFile, outputFile).then(success => {
    process.exit(success ? 0 : 1);
  });
}

// Export for use in other scripts
export { convertCsvToJson };