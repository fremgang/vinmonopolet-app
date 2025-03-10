/**
 * Image utilities for handling cached images and placeholders
 */

/**
 * Get a cached image URL via the image proxy API
 */
export function getCachedImageUrl(originalUrl: string, skipCache = false): string {
    if (!originalUrl) return '';
    return `/api/products/image-cache?url=${encodeURIComponent(originalUrl)}${skipCache ? '&skipCache=true' : ''}`;
  }
  
  /**
   * Check if an image URL is a known placeholder or empty
   */
  export function isPlaceholderImage(url: string): boolean {
    if (!url) return true;
    
    return (
      url.endsWith('bottle.png') || 
      url.includes('/no-image.') ||
      url.includes('/placeholder.') ||
      url.endsWith('/0-1.jpg') // Some sites use this pattern for missing images
    );
  }
  
  /**
   * Get a placeholder image URL for missing images
   */
  export function getPlaceholderImageUrl(width: number = 300, height: number = 400): string {
    return `/api/placeholder?width=${width}&height=${height}`;
  }
  
  /**
   * Generate a shimmer effect for image placeholders
   */
  export function generateShimmer(width: number, height: number): string {
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f6f7f8" stop-opacity="0.6">
              <animate attributeName="offset" values="-2; 1" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stop-color="#edeef1" stop-opacity="0.8">
              <animate attributeName="offset" values="-1.5; 1.5" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stop-color="#f6f7f8" stop-opacity="0.6">
              <animate attributeName="offset" values="-1; 2" dur="2s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#shimmer)" />
      </svg>
    `;
  }
  
  /**
   * Convert shimmer SVG to Base64
   */
  export function shimmerToBase64(svg: string): string {
    const toBase64 = typeof window === 'undefined' 
      ? Buffer.from(svg).toString('base64')
      : btoa(svg);
    
    return `data:image/svg+xml;base64,${toBase64}`;
  }