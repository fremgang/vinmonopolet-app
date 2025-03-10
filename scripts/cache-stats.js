// scripts/cache-stats.js
import fs from 'fs/promises';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.image-cache');

async function getCacheStats() {
  try {
    // Ensure cache directory exists
    try {
      await fs.access(CACHE_DIR);
    } catch (error) {
      console.error('Cache directory does not exist');
      return null;
    }
    
    // Get all files in cache directory
    const files = await fs.readdir(CACHE_DIR);
    
    // Filter out metadata files
    const imageFiles = files.filter(file => !file.endsWith('.meta'));
    const metaFiles = files.filter(file => file.endsWith('.meta'));
    
    console.log(`Found ${imageFiles.length} cached images and ${metaFiles.length} metadata files`);
    
    // Calculate total size
    let totalSize = 0;
    let sizeDistribution = {
      '< 10KB': 0,
      '10KB - 50KB': 0,
      '50KB - 100KB': 0,
      '100KB - 500KB': 0,
      '> 500KB': 0
    };
    
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;
    
    // Process each metadata file
    for (const metaFile of metaFiles) {
      try {
        const metaPath = path.join(CACHE_DIR, metaFile);
        const metaContent = await fs.readFile(metaPath, 'utf-8');
        const metadata = JSON.parse(metaContent);
        
        // Add to total size
        totalSize += metadata.size || 0;
        
        // Track oldest and newest
        if (metadata.cachedAt < oldestTimestamp) {
          oldestTimestamp = metadata.cachedAt;
        }
        if (metadata.cachedAt > newestTimestamp) {
          newestTimestamp = metadata.cachedAt;
        }
        
        // Add to size distribution
        const sizeKB = (metadata.size || 0) / 1024;
        if (sizeKB < 10) {
          sizeDistribution['< 10KB']++;
        } else if (sizeKB < 50) {
          sizeDistribution['10KB - 50KB']++;
        } else if (sizeKB < 100) {
          sizeDistribution['50KB - 100KB']++;
        } else if (sizeKB < 500) {
          sizeDistribution['100KB - 500KB']++;
        } else {
          sizeDistribution['> 500KB']++;
        }
      } catch (error) {
        console.error(`Error processing metadata file ${metaFile}:`, error);
      }
    }
    
    // Calculate average size
    const averageSize = totalSize / imageFiles.length;
    
    // Format timestamps
    const oldestDate = new Date(oldestTimestamp).toLocaleString();
    const newestDate = new Date(newestTimestamp).toLocaleString();
    
    return {
      totalImages: imageFiles.length,
      totalSizeBytes: totalSize,
      totalSizeMB: totalSize / 1024 / 1024,
      averageSizeBytes: averageSize,
      averageSizeKB: averageSize / 1024,
      sizeDistribution,
      oldestImage: oldestDate,
      newestImage: newestDate
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return null;
  }
}

// Format bytes to a human-readable string
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function main() {
  const stats = await getCacheStats();
  
  if (!stats) {
    console.log('No cache statistics available');
    return;
  }
  
  console.log('\nImage Cache Statistics');
  console.log('=====================');
  console.log(`Total cached images: ${stats.totalImages}`);
  console.log(`Total cache size: ${formatBytes(stats.totalSizeBytes)} (${stats.totalSizeMB.toFixed(2)} MB)`);
  console.log(`Average image size: ${formatBytes(stats.averageSizeBytes)} (${stats.averageSizeKB.toFixed(2)} KB)`);
  
  console.log('\nSize Distribution:');
  for (const [range, count] of Object.entries(stats.sizeDistribution)) {
    const percentage = (count / stats.totalImages * 100).toFixed(2);
    console.log(`  ${range}: ${count} (${percentage}%)`);
  }
  
  console.log('\nCache Age:');
  console.log(`  Oldest image: ${stats.oldestImage}`);
  console.log(`  Newest image: ${stats.newestImage}`);
  
  // Calculate and show storage estimates for different sizes
  console.log('\nStorage Estimates for All Products:');
  const averageSizeKB = stats.averageSizeKB;
  
  // Estimate for 1000, 5000, and 10000 products
  [1000, 5000, 10000].forEach(count => {
    const estimatedSizeMB = (averageSizeKB * count) / 1024;
    console.log(`  ${count} products: ${estimatedSizeMB.toFixed(2)} MB`);
  });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});