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

// Forward image directly from source
async function forwardImage(url: string) {
  try {
    // Basic validation
    if (!url.startsWith('https://bilder.vinmonopolet.no/')) {
      throw new Error('Only vinmonopolet.no images are allowed');
    }

    // Use fetch to get the image
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    // Get image data as array buffer
    const imageData = await response.arrayBuffer();

    // Get content type from response or default to jpeg
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';

    // Return image directly
    return new Response(imageData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${CACHE_CONFIG.maxAge}`
      }
    });
  } catch (error) {
    console.error('Error forwarding image:', error);
    return new Response('Image not found', { status: 404 });
  }
}

export async function GET(request: Request) {
  // Get image URL and size from the query string
  const { searchParams } = new URL(request.url);
  const encodedUrl = searchParams.get('url');
  
  // Decode URL parameter properly
  let imageUrl;
  try {
    imageUrl = encodedUrl ? decodeURIComponent(encodedUrl) : null;
  } catch (e) {
    // If double-encoded, try again
    try {
      imageUrl = encodedUrl ? decodeURIComponent(decodeURIComponent(encodedUrl)) : null;
    } catch (e2) {
      imageUrl = null;
    }
  }
  
  const size = searchParams.get('size') || 'medium';
  const skipCache = searchParams.get('skipCache') === 'true';
  
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

  // For now, just forward the image directly without caching
  return forwardImage(imageUrl);
}
