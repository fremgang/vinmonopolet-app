// src/app/api/products/image-cache/route.ts
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

// Check if we're in production or development
const isProd = process.env.NODE_ENV === 'production';

// Define cache directory
const CACHE_DIR = isProd 
  ? '/tmp/image-cache' // Use /tmp in production (Vercel)
  : path.join(process.cwd(), '.image-cache'); // Local development

// Create a hash of the URL to use as filename
function getImageCacheKey(url: string) {
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

// Cache an image
async function cacheImage(url: string, imageData: Buffer) {
  const cacheKey = getImageCacheKey(url);
  const cacheFilePath = path.join(CACHE_DIR, cacheKey);
  
  try {
    await fs.writeFile(cacheFilePath, imageData);
    // Also save metadata file with original URL and timestamp
    const metadata = {
      originalUrl: url,
      cachedAt: Date.now(),
      size: imageData.length
    };
    await fs.writeFile(`${cacheFilePath}.meta`, JSON.stringify(metadata));
    return true;
  } catch (error) {
    console.error('Error writing image to cache:', error);
    return false;
  }
}

// Get an image from cache
async function getImageFromCache(url: string) {
  const cacheKey = getImageCacheKey(url);
  const cacheFilePath = path.join(CACHE_DIR, cacheKey);
  
  try {
    const data = await fs.readFile(cacheFilePath);
    return data;
  } catch (error) {
    return null; // Not in cache or error reading
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
  // Get image URL from the query string
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  const skipCache = searchParams.get('skipCache') === 'true';
  
  // Validate URL
  if (!imageUrl) {
    return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
  }
  
  // Only allow vinmonopolet.no images
  if (!imageUrl.startsWith('https://bilder.vinmonopolet.no/')) {
    return NextResponse.json({ error: 'Only vinmonopolet.no images are supported' }, { status: 400 });
  }
  
  try {
    // Ensure cache directory exists
    await ensureCacheDir();
    
    // Try to get from cache first (unless skipCache is true)
    if (!skipCache) {
      const cachedImage = await getImageFromCache(imageUrl);
      
      if (cachedImage) {
        // Return cached image with appropriate headers
        const headers = new Headers();
        headers.set('Content-Type', 'image/jpeg'); // Assume JPEG for vinmonopolet images
        headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        headers.set('X-Cache', 'HIT');
        
        return new Response(cachedImage, { headers });
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
    
    // Cache the image (unless skipCache is true)
    if (!skipCache) {
      await cacheImage(imageUrl, buffer);
    }
    
    // Get content type from original response or default to jpeg
    const contentType = imageResponse.headers.get('Content-Type') || 'image/jpeg';
    
    // Return the image with caching headers
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    headers.set('X-Cache', 'MISS');
    
    return new Response(buffer, { headers });
  } catch (error) {
    console.error('Error serving cached image:', error);
    
    // Fallback to redirect to the original URL
    return NextResponse.redirect(imageUrl);
  }
}