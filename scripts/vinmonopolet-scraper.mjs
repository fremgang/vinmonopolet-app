// vinmonopolet-scraper.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { setTimeout } from 'timers/promises';

// Initialize Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

// Utility to format numbers from Norwegian format (space as thousand separator, comma as decimal)
function parseNorwegianNumber(numberStr) {
  if (!numberStr) return null;
  
  // Clean the string - remove kr, NOK, and other non-numeric characters except spaces and commas
  const cleaned = numberStr.replace(/[^0-9\s,.]/g, '').trim();
  
  // Replace comma with dot for decimal and remove spaces
  const normalized = cleaned.replace(/\s+/g, '').replace(',', '.');
  
  // Convert to number
  const number = parseFloat(normalized);
  return isNaN(number) ? null : number;
}

// Function to scrape a single product page
async function scrapeProduct(productId) {
  try {
    console.log(`Scraping product: ${productId}`);
    const url = `https://www.vinmonopolet.no/p/${productId}`;
    
    // Add a random delay between 1-3 seconds to avoid being blocked
    await setTimeout(1000 + Math.random() * 2000);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,nb-NO;q=0.8,nb;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      timeout: 10000,
    });
    
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    // Find the price information
    const priceElement = document.querySelector('[data-test="product-price"]');
    let price = null;
    
    if (priceElement) {
      const priceText = priceElement.textContent;
      price = parseNorwegianNumber(priceText);
      console.log(`Found price for ${productId}: ${price} NOK`);
    } else {
      console.log(`No price found for ${productId}`);
    }
    
    // Additional data we might want to scrape
    const nameElement = document.querySelector('[data-test="product-name"]');
    const name = nameElement ? nameElement.textContent.trim() : null;
    
    return {
      product_id: productId,
      price,
      name,
      url,
    };
  } catch (error) {
    console.error(`Error scraping product ${productId}:`, error.message);
    return {
      product_id: productId,
      error: error.message,
    };
  }
}

// Function to update product prices in the database
async function updateProductPrice(productId, price) {
  try {
    await prisma.products.update({
      where: { product_id: productId },
      data: { price },
    });
    console.log(`Updated price for ${productId} to ${price} NOK`);
    return true;
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error.message);
    return false;
  }
}

// Main function to scrape products with missing prices
async function scrapeMissingPrices() {
  try {
    console.log('Starting to scrape missing prices...');
    
    // Find products with null prices
    const productsWithNullPrices = await prisma.products.findMany({
      where: { price: null },
      select: { product_id: true },
    });
    
    console.log(`Found ${productsWithNullPrices.length} products with null prices`);
    
    // Find products with suspiciously low prices (below 50)
    const productsWithLowPrices = await prisma.products.findMany({
      where: { 
        price: { lt: 50, not: null }
      },
      select: { product_id: true, price: true },
    });
    
    console.log(`Found ${productsWithLowPrices.length} products with suspiciously low prices`);
    
    // Combine the lists
    const productIdsToScrape = [
      ...productsWithNullPrices.map(p => p.product_id),
      ...productsWithLowPrices.map(p => p.product_id)
    ];
    
    // Add specific product IDs that we know should have higher prices
    const specificProductIds = ['18961501']; // Example from the prompt
    for (const id of specificProductIds) {
      if (!productIdsToScrape.includes(id)) {
        productIdsToScrape.push(id);
      }
    }
    
    console.log(`Total products to scrape: ${productIdsToScrape.length}`);
    
    // Create a results directory
    const resultsDir = path.join(process.cwd(), 'scrape-results');
    await fs.mkdir(resultsDir, { recursive: true });
    
    // Process in small batches to avoid overwhelming the server
    const batchSize = 10;
    const results = [];
    const errors = [];
    
    for (let i = 0; i < productIdsToScrape.length; i += batchSize) {
      const batch = productIdsToScrape.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(productIdsToScrape.length / batchSize)}`);
      
      // Scrape batch concurrently
      const scrapePromises = batch.map(productId => scrapeProduct(productId));
      const batchResults = await Promise.all(scrapePromises);
      
      // Process results
      for (const result of batchResults) {
        if (result.error) {
          errors.push(result);
        } else if (result.price !== null) {
          results.push(result);
          
          // Update the price in the database
          await updateProductPrice(result.product_id, result.price);
        }
      }
      
      // Save intermediate results
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await fs.writeFile(
        path.join(resultsDir, `batch-${Math.floor(i / batchSize) + 1}-results-${timestamp}.json`),
        JSON.stringify(batchResults, null, 2)
      );
      
      // Wait a bit between batches
      console.log('Waiting between batches...');
      await setTimeout(5000);
    }
    
    // Save final results
    const finalResultsPath = path.join(resultsDir, `final-results-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    await fs.writeFile(finalResultsPath, JSON.stringify({ 
      results, 
      errors,
      stats: {
        totalScraped: productIdsToScrape.length,
        successful: results.length,
        errors: errors.length
      }
    }, null, 2));
    
    console.log('Scraping completed!');
    console.log(`Successfully scraped ${results.length} products`);
    console.log(`Encountered errors for ${errors.length} products`);
    console.log(`Results saved to ${finalResultsPath}`);
    
    // Check for high-value products
    const highValueProducts = results.filter(p => p.price > 50000);
    if (highValueProducts.length > 0) {
      console.log(`Found ${highValueProducts.length} high-value products (>50,000 NOK):`);
      highValueProducts.forEach(p => {
        console.log(`${p.product_id}: ${p.name} - ${p.price} NOK`);
      });
    }
    
  } catch (error) {
    console.error('Error during scraping process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export a specific product ID function for testing
async function testScrapeSpecificProduct(productId) {
  try {
    console.log(`Testing scraper with product ID: ${productId}`);
    const result = await scrapeProduct(productId);
    console.log('Scrape result:', result);
    return result;
  } catch (error) {
    console.error('Test scrape error:', error);
  }
}

// Run the main function if this script is executed directly
if (import.meta === module) {
  // Check for command line arguments
  const args = process.argv.slice(2);
  if (args.length > 0 && args[0] === '--test') {
    // Test mode with specific product ID
    const productId = args[1] || '18961501'; // Default to the example product ID
    testScrapeSpecificProduct(productId).catch(console.error);
  } else {
    // Normal mode - scrape all missing prices
    scrapeMissingPrices().catch(console.error);
  }
}

// Export functions for potential use in other scripts
export {
  scrapeMissingPrices,
  scrapeProduct,
  testScrapeSpecificProduct
};