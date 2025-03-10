// scripts/cache-images.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { createHash } from 'crypto';
import readline from 'readline';

const prisma = new PrismaClient();
const CONCURRENCY = 5; // Number of concurrent requests
const CACHE_DIR = path.join(process.cwd(), '.image-cache');
const BATCH_SIZE = 50; // Number of products to process in each batch

// Image sizes available on vinmonopolet.no
const IMAGE_SIZES = {
  'tiny': '100x100-0',   // ~5-10KB per image
  'small': '300x300-0',  // ~15-30KB per image
  'medium': '515x515-0', // ~30-60KB per image
  'large': '800x800-0'   // ~60-120KB per image
};

// Parse command line arguments
const args = process.argv.slice(2);
const sizeArg = args.find(arg => arg.startsWith('--size='));
const limitArg = args.find(arg => arg.startsWith('--limit='));
const forceArg = args.find(arg => arg === '--force');

const selectedSize = sizeArg ? sizeArg.split('=')[1] : 'small';
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : Number.MAX_SAFE_INTEGER;
const forceRecache = !!forceArg;

if (!Object.keys(IMAGE_SIZES).includes(selectedSize)) {
  console.error(`Invalid size: ${selectedSize}. Available sizes: ${Object.keys(IMAGE_SIZES).join(', ')}`);
  process.exit(1);
}

// Create a hash of the URL to use as filename
function getImageCacheKey(url) {
  return createHash('md5').update(url).digest('hex');
}

// Make sure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    return true;
  } catch (error) {
    console.error('Error creating cache directory:', error);
    return false;
  }
}

// Check if an image is already cached
async function isImageCached(url) {
  if (forceRecache) return false;
  
  const cacheKey = getImageCacheKey(url);
  const cacheFilePath = path.join(CACHE_DIR, cacheKey);
  
  try {
    await fs.access(cacheFilePath);
    return true;
  } catch (error) {
    return false;
  }
}

// Check if an image exists on the remote server
async function checkImageExists(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 Vinmonopolet Explorer'
      }
    });
    return response.ok;
  } catch (error) {
    console.error(`Error checking if image exists: ${url}`, error);
    return false;
  }
}

// Cache an image
async function cacheImage(url) {
  if (await isImageCached(url)) {
    console.log(`Image already cached: ${url}`);
    return { success: true, cached: false, size: 0 };
  }
  
  const imageExists = await checkImageExists(url);
  if (!imageExists) {
    console.log(`Image does not exist: ${url}`);
    return { success: false, cached: false, size: 0 };
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 Vinmonopolet Explorer'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch image: ${url}`);
      return { success: false, cached: false, size: 0 };
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    const cacheKey = getImageCacheKey(url);
    const cacheFilePath = path.join(CACHE_DIR, cacheKey);
    
    await fs.writeFile(cacheFilePath, buffer);
    
    // Save metadata file with original URL and timestamp
    const metadata = {
      originalUrl: url,
      cachedAt: Date.now(),
      size: buffer.length
    };
    
    await fs.writeFile(`${cacheFilePath}.meta`, JSON.stringify(metadata));
    
    console.log(`Cached image: ${url} (${buffer.length} bytes)`);
    return { success: true, cached: true, size: buffer.length };
  } catch (error) {
    console.error(`Error caching image: ${url}`, error);
    return { success: false, cached: false, size: 0 };
  }
}

// Process images in batches with concurrency
async function processImages(productIds) {
  let processed = 0;
  let totalSize = 0;
  let cached = 0;
  let failed = 0;
  
  const sizeSuffix = IMAGE_SIZES[selectedSize];
  
  for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
    const batch = productIds.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(productIds.length / BATCH_SIZE)} (${batch.length} products)`);
    
    // Process each batch with concurrency
    for (let j = 0; j < batch.length; j += CONCURRENCY) {
      const concurrentBatch = batch.slice(j, j + CONCURRENCY);
      
      // Process each image in the concurrent batch
      const promises = concurrentBatch.map(async (productId) => {
        const imageUrl = `https://bilder.vinmonopolet.no/cache/${sizeSuffix}/${productId}-1.jpg`;
        const result = await cacheImage(imageUrl);
        
        processed++;
        if (result.success) {
          if (result.cached) {
            cached++;
            totalSize += result.size;
          }
        } else {
          failed++;
        }
        
        // Update progress
        const progress = (processed / productIds.length * 100).toFixed(2);
        process.stdout.write(`\rProgress: ${progress}% (${processed}/${productIds.length}, Cached: ${cached}, Failed: ${failed})`);
      });
      
      await Promise.all(promises);
    }
  }
  
  console.log(`\nFinished processing ${processed} products`);
  console.log(`Cached ${cached} images (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`Failed to cache ${failed} images`);
  
  return { processed, cached, failed, totalSize };
}

// Calculate estimated storage needed
function calculateStorageNeeded(count, selectedSize) {
  // Rough estimates based on selected size
  const averageSizeKB = {
    'tiny': 7.5,     // Average 7.5KB per image
    'small': 22.5,   // Average 22.5KB per image
    'medium': 45,    // Average 45KB per image
    'large': 90      // Average 90KB per image
  };
  
  const estimatedSizeKB = count * averageSizeKB[selectedSize];
  
  if (estimatedSizeKB < 1024) {
    return `${estimatedSizeKB.toFixed(2)} KB`;
  } else if (estimatedSizeKB < 1024 * 1024) {
    return `${(estimatedSizeKB / 1024).toFixed(2)} MB`;
  } else {
    return `${(estimatedSizeKB / 1024 / 1024).toFixed(2)} GB`;
  }
}

// Main function
async function main() {
  console.log(`Starting image caching process...`);
  console.log(`Selected image size: ${selectedSize} (${IMAGE_SIZES[selectedSize]})`);
  
  // Ensure cache directory exists
  if (!await ensureCacheDir()) {
    console.error('Failed to create cache directory');
    process.exit(1);
  }
  
  // Get all product IDs from the database
  console.log('Fetching product IDs from database...');
  
  const products = await prisma.products.findMany({
    select: {
      product_id: true
    },
    take: limit
  });
  
  const productIds = products.map(p => p.product_id);
  console.log(`Found ${productIds.length} products`);
  
  // Calculate estimated storage needed
  const estimatedStorage = calculateStorageNeeded(productIds.length, selectedSize);
  console.log(`Estimated storage needed: ${estimatedStorage}`);
  
  // Ask for confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question(`Do you want to continue? (y/n) `, async (answer) => {
    rl.close();
    
    if (answer.toLowerCase() !== 'y') {
      console.log('Aborted');
      await prisma.$disconnect();
      process.exit(0);
    }
    
    // Process images
    const startTime = Date.now();
    const result = await processImages(productIds);
    const endTime = Date.now();
    
    console.log(`\nTotal time: ${((endTime - startTime) / 1000 / 60).toFixed(2)} minutes`);
    console.log(`Total size: ${(result.totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    await prisma.$disconnect();
  });
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});