// src/app/api/products/image-cache/route.ts
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

// Define environment-specific configurations
const isProd = process.env.NODE_ENV === 'production';

// Cache configuration
const CACHE_CONFIG = {
  baseDir: isProd 
    ? '/tmp/image-cache' // Use /tmp in production (Vercel)
    : path.join(process.cwd(), '.image-cache'), // Local development
  ttl: 60 * 60 * 24 * 30, // 30 days in seconds
  sizes: {
    tiny: { width: 100, height: 100 },
    small: { width: 300, height: 300 },
    medium: { width: 515, height: 515 },
    large: { width: 800, height: 800 }
  },
  quality: 85, // JPEG quality
  compression: 9, // PNG compression level
  avifQuality: 60, // AVIF quality
  webpQuality: 80, // WebP quality
  useWebp: true, // Convert to WebP when possible
  useAvif: false, // Experimental AVIF support
  maxAge: 31536000, // 1 year in seconds
  staleWhileRevalidate: 86400, // 1 day in seconds
};

// Create a hash of the URL to use as filename
function getImageCacheKey(url: string) {
  return createHash('md5').update(url).digest('hex');
}

// Get cache folder path for specific size
function getCacheFolderPath(size: string) {
  return path.join(CACHE_CONFIG.baseDir, size);
}

// Get cache file path for a specific URL and size
function getCacheFilePath(url: string, size: string) {
  const cacheKey = getImageCacheKey(url);
  return path.join(getCacheFolderPath(size), cacheKey);
}

// Make sure cache directory exists
async function ensureCacheDir(size: string) {
  try {
    await fs.mkdir(getCacheFolderPath(size), { recursive: true });
    return true;
  } catch (error) {
    console.error(`Error creating cache directory for ${size}:`, error);
    return false;
  }
}

// Get an image from cache
async function getImageFromCache(url: string, size: string) {
  const cacheFilePath = getCacheFilePath(url, size);
  
  try {
    // Check if cache file exists
    await fs.access(cacheFilePath);
    
    // Read cache metadata
    const metaPath = `${cacheFilePath}.meta`;
    try {
      const metaData = JSON.parse(await fs.readFile(metaPath, 'utf8'));
      
      // Check if cache is expired
      if (metaData.cachedAt && Date.now() - metaData.cachedAt > CACHE_CONFIG.ttl * 1000) {
        return null; // Cache expired
      }
      
      // Read the actual file
      const data = await fs.readFile(cacheFilePath);
      return {
        data,
        contentType: metaData.contentType || 'image/jpeg',
        size: metaData.contentLength || data.length
      };
    } catch (err) {
      // Metadata missing, just return the file
      const data = await fs.readFile(cacheFilePath);
      return {
        data,
        contentType: 'image/jpeg',
        size: data.length
      };
    }
  } catch (error) {
    return null; // Not in cache or error reading
  }
}

// Cache an optimized image
async function cacheOptimizedImage(url: string, imageData: Buffer, size: string, contentType: string) {
  const cacheFilePath = getCacheFilePath(url, size);
  
  try {
    // Get target dimensions for this size
    const dimensions = CACHE_CONFIG.sizes[size as keyof typeof CACHE_CONFIG.sizes] || CACHE_CONFIG.sizes.medium;
    
    // Process with sharp for optimization
    let processedImage;
    
    // Configure sharp
    let sharpInstance = sharp(imageData)
      .resize({
        width: dimensions.width,
        height: dimensions.height,
        fit: 'inside',
        withoutEnlargement: true
      });
    
    // Choose output format based on content type and configuration
    if (CACHE_CONFIG.useWebp) {
      processedImage = await sharpInstance.webp({ quality: CACHE_CONFIG.webpQuality }).toBuffer();
      contentType = 'image/webp';
    } else if (CACHE_CONFIG.useAvif && contentType.includes('image/')) {
      processedImage = await sharpInstance.avif({ quality: CACHE_CONFIG.avifQuality }).toBuffer();
      contentType = 'image/avif';
    } else if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
      processedImage = await sharpInstance.jpeg({ quality: CACHE_CONFIG.quality }).toBuffer();
    } else if (contentType.includes('image/png')) {
      processedImage = await sharpInstance.png({ compressionLevel: CACHE_CONFIG.compression }).toBuffer();
    } else {
      // For unsupported formats, just use the original
      processedImage = imageData;
    }
    
    // Write optimized image to cache
    await fs.writeFile(cacheFilePath, processedImage);
    
    // Save metadata for the cached image
    const metadata = {
      originalUrl: url,
      cachedAt: Date.now(),
      contentType,
      contentLength: processedImage.length,
      size,
      width: dimensions.width,
      height: dimensions.height,
      optimized: true
    };
    
    await fs.writeFile(`${cacheFilePath}.meta`, JSON.stringify(metadata));
    
    return {
      data: processedImage,
      contentType,
      size: processedImage.length
    };
  } catch (error) {
    console.error(`Error caching optimized image for ${url}:`, error);
    
    // Fallback to saving the original without optimization
    try {
      await fs.writeFile(cacheFilePath, imageData);
      
      const metadata = {
        originalUrl: url,
        cachedAt: Date.now(),
        contentType,
        contentLength: imageData.length,
        size,
        optimized: false
      };
      
      await fs.writeFile(`${cacheFilePath}.meta`, JSON.stringify(metadata));
      
      return {
        data: imageData,
        contentType,
        size: imageData.length
      };
    } catch (fallbackError) {
      console.error(`Fallback error caching image for ${url}:`, fallbackError);
      throw error; // Re-throw the original error
    }
  }
}

// Check if an image exists on the remote server without downloading it
async function checkImageExists(url: string) {
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

export async function GET(request: Request) {
  // Get image URL and size from the query string
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  const size = searchParams.get('size') || 'medium';
  const skipCache = searchParams.get('skipCache') === 'true';
  const forceWebp = searchParams.get('webp') === 'true';
  
  // Validate URL
  if (!imageUrl) {
    return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
  }
  
  // Only allow vinmonopolet.no images
  if (!imageUrl.startsWith('https://bilder.vinmonopolet.no/')) {
    return NextResponse.json({ error: 'Only vinmonopolet.no images are supported' }, { status: 400 });
  }
  
  // Validate size
  if (!(size in CACHE_CONFIG.sizes)) {
    return NextResponse.json({ error: `Invalid size: ${size}. Valid sizes: ${Object.keys(CACHE_CONFIG.sizes).join(', ')}` }, { status: 400 });
  }
  
  try {
    // Ensure cache directory exists for this size
    await ensureCacheDir(size);
    
    // Try to get from cache first (unless skipCache is true)
    if (!skipCache) {
      const cachedImage = await getImageFromCache(imageUrl, size);
      
      if (cachedImage) {
        // Return cached image with appropriate headers
        const headers = new Headers();
        headers.set('Content-Type', cachedImage.contentType);
        headers.set('Cache-Control', `public, max-age=${CACHE_CONFIG.maxAge}, stale-while-revalidate=${CACHE_CONFIG.staleWhileRevalidate}`);
        headers.set('X-Cache', 'HIT');
        
        return new Response(cachedImage.data, { headers });
      }
    }
    
    // Check if image exists on remote server before trying to fetch it
    const imageExists = await checkImageExists(imageUrl);
    
    if (!imageExists) {
      // If image doesn't exist, return a 404 response
      return NextResponse.json({ error: 'Image not found on remote server' }, { status: 404 });
    }
    
    // Not in cache or skipCache is true, fetch from origin
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 Vinmonopolet Explorer'
      }
    });
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }
    
    // Get image data
    const imageData = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(imageData);
    
    // Get content type from original response or default to jpeg
    const contentType = imageResponse.headers.get('Content-Type') || 'image/jpeg';
    
    // Cache the optimized image (unless skipCache is true)
    let finalImageData = buffer;
    let finalContentType = contentType;
    
    if (!skipCache) {
      try {
        // Process and cache the image with sharp
        const optimizedImage = await cacheOptimizedImage(
          imageUrl, 
          buffer, 
          size, 
          forceWebp ? 'image/webp' : contentType
        );
        
        finalImageData = Buffer.from(optimizedImage.data);
        finalContentType = optimizedImage.contentType;
      } catch (optimizationError) {
        console.error('Error optimizing image:', optimizationError);
        // Continue with original image data on error
      }
    }
    
    // Return the image with caching headers
    const headers = new Headers();
    headers.set('Content-Type', finalContentType);
    headers.set('Cache-Control', `public, max-age=${CACHE_CONFIG.maxAge}, stale-while-revalidate=${CACHE_CONFIG.staleWhileRevalidate}`);
    headers.set('X-Cache', 'MISS');
    
    return new Response(finalImageData, { headers });
  } catch (error) {
    console.error('Error serving cached image:', error);
    
    // Fallback to redirect to the original URL
    return NextResponse.redirect(imageUrl);
  }
}