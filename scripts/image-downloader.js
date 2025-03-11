// scripts/enhanced-image-downloader.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { createHash } from 'crypto';
import { setTimeout } from 'timers/promises';
import readline from 'readline';

const prisma = new PrismaClient();

// Image sizes available on vinmonopolet.no
const IMAGE_SIZES = {
  'tiny': '100x100-0',   // ~5-10KB per image
  'small': '300x300-0',  // ~15-30KB per image
  'medium': '515x515-0', // ~30-60KB per image
  'large': '800x800-0'   // ~60-120KB per image
};

// Default options
const DEFAULT_OPTIONS = {
  concurrency: 5,              // Number of concurrent downloads
  batchSize: 20,               // Products per batch
  cachePath: '.image-cache',   // Root cache directory
  sizes: ['small', 'medium'],  // Default sizes to download
  delay: 100,                  // Delay between downloads (ms)
  force: false,                // Force re-download existing images
  limit: Infinity,             // No limit by default
  timeout: 10000,              // 10 seconds timeout
  retries: 2,                  // Number of retries for failed downloads
  validateImages: true,        // Validate downloaded images
  logLevel: 'info',            // Log level (error, warn, info, debug)
  checksumVerification: true,  // Verify image integrity
};

// Create a hash of the URL to use as filename
function getImageCacheKey(url) {
  return createHash('md5').update(url).digest('hex');
}

// Get cache folder path for specific size
function getCacheFolderPath(options, size) {
  return path.join(options.cachePath, size);
}

// Get cache file path for a specific URL
function getCacheFilePath(options, url, size) {
  const cacheKey = getImageCacheKey(url);
  return path.join(getCacheFolderPath(options, size), cacheKey);
}

// Create folder structure
async function createFolderStructure(options) {
  // Create main cache directory
  await fs.mkdir(options.cachePath, { recursive: true });
  
  // Create subdirectories for each size
  for (const size of options.sizes) {
    await fs.mkdir(getCacheFolderPath(options, size), { recursive: true });
  }
  
  // Create stats directory
  await fs.mkdir(path.join(options.cachePath, 'stats'), { recursive: true });
}

// Check if an image is already cached
async function isImageCached(options, url, size) {
  if (options.force) return false;
  
  const cacheFilePath = getCacheFilePath(options, url, size);
  
  try {
    await fs.access(cacheFilePath);
    return true;
  } catch (error) {
    return false;
  }
}

// Check if an image exists on the server with HEAD request
async function checkImageExists(url, timeout = 5000) {
  try {
    const response = await axios({
      method: 'HEAD',
      url,
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 Vinmonopolet Explorer'
      }
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Download and cache an image
async function downloadImage(options, url, size, retryCount = 0) {
  // Check if already cached
  if (await isImageCached(options, url, size)) {
    if (options.logLevel === 'debug') {
      console.log(`Already cached: ${url} (${size})`);
    }
    return { success: true, cached: true, size: 0, url, imageSize: size };
  }
  
  // Check if image exists on remote server
  const imageExists = await checkImageExists(url);
  if (!imageExists) {
    console.log(`Image does not exist: ${url} (${size})`);
    return { success: false, error: 'not_found', url, imageSize: size };
  }
  
  try {
    // Download the image
    const response = await axios({
      method: 'GET',
      url,
      responseType: 'arraybuffer',
      timeout: options.timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 Vinmonopolet Explorer',
        'Accept': 'image/webp,image/jpeg,image/png,image/*',
        'Cache-Control': 'no-cache'
      }
    });
    
    // Validate image response
    if (options.validateImages) {
      // Check content type
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }
      
      // Check image size
      if (response.data.length < 100) {
        throw new Error('Image too small, likely a placeholder');
      }
    }
    
    // Convert to buffer
    const buffer = Buffer.from(response.data);
    
    // Save image to cache
    const cacheFilePath = getCacheFilePath(options, url, size);
    await fs.writeFile(cacheFilePath, buffer);
    
    // Save metadata for the cached image
    const metadata = {
      originalUrl: url,
      cachedAt: Date.now(),
      contentType: response.headers['content-type'],
      contentLength: buffer.length,
      size,
      checksum: createHash('md5').update(buffer).digest('hex')
    };
    
    await fs.writeFile(`${cacheFilePath}.meta`, JSON.stringify(metadata, null, 2));
    
    // Log success message
    if (options.logLevel === 'info' || options.logLevel === 'debug') {
      console.log(`Downloaded: ${url} (${size}, ${buffer.length} bytes)`);
    }
    
    return { 
      success: true, 
      cached: false, 
      size: buffer.length, 
      url, 
      imageSize: size,
      contentType: response.headers['content-type'] 
    };
  } catch (error) {
    // Retry logic
    if (retryCount < options.retries) {
      console.warn(`Retrying download (${retryCount + 1}/${options.retries}): ${url}`);
      await setTimeout(1000); // Wait a second before retrying
      return downloadImage(options, url, size, retryCount + 1);
    }
    
    console.error(`Error downloading ${url} (${size}):`, error.message);
    return { 
      success: false, 
      error: error.message,
      url,
      imageSize: size
    };
  }
}

// Process a batch of products
async function processBatch(options, products, stats) {
  const batch = products.slice(0, options.batchSize);
  console.log(`Processing batch of ${batch.length} products...`);
  
  // Process each product
  for (const product of batch) {
    for (const size of options.sizes) {
      const sizeCode = IMAGE_SIZES[size];
      if (!sizeCode) {
        console.warn(`Invalid size: ${size}`);
        continue;
      }
      
      // Construct image URL
      const imageUrl = `https://bilder.vinmonopolet.no/cache/${sizeCode}/${product.product_id}-1.jpg`;
      
      // Download with a small delay to avoid overwhelming the server
      const result = await downloadImage(options, imageUrl, size);
      
      // Update stats
      stats.total++;
      stats.totalBySize[size] = (stats.totalBySize[size] || 0) + 1;
      
      if (result.success) {
        stats.success++;
        stats.successBySize[size] = (stats.successBySize[size] || 0) + 1;
        
        if (!result.cached) {
          stats.downloaded++;
          stats.downloadedBySize[size] = (stats.downloadedBySize[size] || 0) + 1;
          stats.totalSize += result.size;
        } else {
          stats.cached++;
          stats.cachedBySize[size] = (stats.cachedBySize[size] || 0) + 1;
        }
      } else {
        stats.failed++;
        stats.failedBySize[size] = (stats.failedBySize[size] || 0) + 1;
        
        // Track error types
        const errorType = result.error || 'unknown';
        stats.errorTypes[errorType] = (stats.errorTypes[errorType] || 0) + 1;
      }
      
      // Add small delay between requests
      await setTimeout(options.delay);
    }
    
    // Update progress
    if (options.logLevel !== 'error') {
      const progress = ((stats.total / options.totalExpected) * 100).toFixed(2);
      process.stdout.write(`\rProgress: ${progress}% (${stats.total}/${options.totalExpected}, Success: ${stats.success}, Failed: ${stats.failed})`);
    }
  }
  
  // Save stats periodically
  await saveStats(options, stats);
  
  return stats;
}

// Save statistics to a file
async function saveStats(options, stats) {
  const statsFile = path.join(options.cachePath, 'stats', `stats-${Date.now()}.json`);
  await fs.writeFile(statsFile, JSON.stringify(stats, null, 2));
  
  // Also save to the latest stats file
  await fs.writeFile(
    path.join(options.cachePath, 'stats', 'latest.json'),
    JSON.stringify(stats, null, 2)
  );
}

// Optimize cached images
async function optimizeCache(options) {
  console.log('Optimizing image cache...');
  
  // 1. Gather statistics
  const stats = {
    duplicates: 0,
    corrupted: 0,
    missing: 0,
    optimized: 0,
    totalSizeBefore: 0,
    totalSizeAfter: 0
  };
  
  // 2. Check each size directory
  for (const size of options.sizes) {
    const sizeDir = getCacheFolderPath(options, size);
    
    // Get all cached files
    const files = await fs.readdir(sizeDir);
    const imageFiles = files.filter(file => !file.endsWith('.meta'));
    
    console.log(`Checking ${imageFiles.length} cached images in ${size} directory...`);
    
    // Check each file
    for (const file of imageFiles) {
      const filePath = path.join(sizeDir, file);
      const metaPath = `${filePath}.meta`;
      
      try {
        // Check if metadata exists
        let metadata;
        try {
          const metaContent = await fs.readFile(metaPath, 'utf-8');
          metadata = JSON.parse(metaContent);
        } catch (err) {
          // Create metadata if missing
          const fileStats = await fs.stat(filePath);
          const fileContent = await fs.readFile(filePath);
          
          metadata = {
            cachedAt: fileStats.mtime.getTime(),
            contentLength: fileContent.length,
            size,
            checksum: createHash('md5').update(fileContent).digest('hex')
          };
          
          await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2));
          stats.missing++;
        }
        
        // Verify checksum
        if (options.checksumVerification && metadata.checksum) {
          const fileContent = await fs.readFile(filePath);
          const actualChecksum = createHash('md5').update(fileContent).digest('hex');
          
          if (actualChecksum !== metadata.checksum) {
            console.warn(`Corrupted file detected: ${filePath}`);
            stats.corrupted++;
            
            // Re-download if URL available
            if (metadata.originalUrl) {
              await downloadImage(options, metadata.originalUrl, size);
            }
          }
        }
        
        // Update statistics
        stats.totalSizeBefore += (metadata.contentLength || 0);
      } catch (error) {
        console.error(`Error optimizing ${filePath}:`, error.message);
      }
    }
  }
  
  console.log('\nCache optimization completed:');
  console.log(`- Missing metadata fixed: ${stats.missing}`);
  console.log(`- Corrupted files found: ${stats.corrupted}`);
  console.log(`- Duplicate entries: ${stats.duplicates}`);
  
  return stats;
}

// Main function to process all products
async function downloadProductImages(options = {}) {
  // Merge with default options
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  console.log('Starting product image download...');
  console.log(`Sizes to download: ${config.sizes.join(', ')}`);
  
  // Create folder structure
  await createFolderStructure(config);
  
  // Initialize stats
  const stats = {
    startTime: Date.now(),
    total: 0,
    success: 0,
    failed: 0,
    downloaded: 0,
    cached: 0,
    totalSize: 0,
    totalBySize: {},
    successBySize: {},
    failedBySize: {},
    downloadedBySize: {},
    cachedBySize: {},
    errorTypes: {}
  };
  
  try {
    // Get products from database
    console.log('Fetching products from database...');
    
    const productCount = await prisma.products.count();
    const limit = Math.min(config.limit, productCount);
    
    console.log(`Found ${productCount} products, will process ${limit}`);
    
    // Calculate total expected download count
    config.totalExpected = limit * config.sizes.length;
    
    // Ask for confirmation
    if (config.requireConfirmation !== false) {
      const read_line = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      // Calculate estimated storage
      const estimatedSizeMB = (limit * config.sizes.length * 30) / 1024; // 30KB average per image
      
      const answer = await new Promise(resolve => {
        read_line.question(
          `This will download approximately ${estimatedSizeMB.toFixed(2)} MB. Continue? (y/n) `,
          resolve
        );
      });
      
      read_line.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('Aborted');
        return null;
      }
    }
    
    // Get all product IDs
    const products = await prisma.products.findMany({
      select: { product_id: true },
      take: limit
    });
    
    // Process in batches
    for (let i = 0; i < products.length; i += config.batchSize) {
      const batch = products.slice(i, i + config.batchSize);
      await processBatch(config, batch, stats);
    }
    
    // Calculate total time
    stats.endTime = Date.now();
    stats.totalTime = (stats.endTime - stats.startTime) / 1000;
    
    console.log('\nDownload completed in', stats.totalTime.toFixed(2), 'seconds');
    console.log(`Downloaded ${stats.downloaded} images, ${stats.cached} already cached, ${stats.failed} failed`);
    console.log(`Total file size: ${(stats.totalSize / (1024 * 1024)).toFixed(2)} MB`);
    
    // Save final stats
    await saveStats(config, stats);
    
    return stats;
  } catch (error) {
    console.error('Error in download process:', error);
    
    // Save stats even on error
    stats.endTime = Date.now();
    stats.error = error.message;
    await saveStats(config, stats);
    
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// Optimize cache if run with --optimize
async function main() {
  const args = process.argv.slice(2);
  const options = { ...DEFAULT_OPTIONS };
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--sizes' && i + 1 < args.length) {
      options.sizes = args[++i].split(',');
    } else if (arg === '--concurrency' && i + 1 < args.length) {
      options.concurrency = parseInt(args[++i], 10);
    } else if (arg === '--limit' && i + 1 < args.length) {
      options.limit = parseInt(args[++i], 10);
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--optimize') {
      // Run optimization instead of download
      await optimizeCache(options);
      return;
    } else if (arg === '--help') {
      console.log(`
Usage: node enhanced-image-downloader.js [options]

Options:
  --sizes tiny,small,medium,large    Sizes to download (default: small,medium)
  --concurrency 10                   Number of concurrent downloads (default: 5)
  --limit 100                        Max number of products to process
  --force                            Force re-download existing images
  --optimize                         Run cache optimization only
  --help                             Show this help
      `);
      return;
    }
  }
  
  await downloadProductImages(options);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export for use in other scripts
export { downloadProductImages, optimizeCache };