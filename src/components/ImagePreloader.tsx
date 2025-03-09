// src/components/ImagePreloader.tsx
import React, { useEffect } from 'react';
import type { Product } from '@/app/page';
import ImageCache from '@/utils/imageCache';

interface ImagePreloaderProps {
  products: Product[];
  visibleStart: number;
  visibleEnd: number;
  prefetchCount: number;
}

export default function ImagePreloader({ 
  products, 
  visibleStart, 
  visibleEnd, 
  prefetchCount = 50 
}: ImagePreloaderProps) {
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    // Calculate range of images to preload
    const startIndex = visibleEnd;
    const endIndex = Math.min(startIndex + prefetchCount, products.length);
    const imagesToPreload: string[] = [];
    
    // Collect image URLs to preload, excluding known placeholders
    for (let i = startIndex; i < endIndex; i++) {
      const product = products[i];
      if (!product) continue;
      
      // Skip if this image is already known to be a placeholder
      if (product.imageSmall && !ImageCache.isPlaceholder(product.imageSmall)) {
        imagesToPreload.push(product.imageSmall);
      }
    }
    
    // Only preload a reasonable number of images at once (max 20)
    const batchSize = 20;
    const imagesToPreloadNow = imagesToPreload.slice(0, batchSize);
    
    if (imagesToPreloadNow.length === 0) return;
    
    // Create image objects to preload
    const preloadPromises = imagesToPreloadNow.map(src => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          ImageCache.markAsLoaded(src);
          resolve(src);
        };
        img.onerror = () => {
          ImageCache.markAsPlaceholder(src);
          reject(src);
        };
        img.src = src;
      });
    });
    
    // Track load status
    Promise.allSettled(preloadPromises).then(results => {
      results.forEach((result, index) => {
        const src = imagesToPreloadNow[index];
        if (result.status === 'fulfilled') {
          // Image loaded successfully
          console.log(`Preloaded image: ${src}`);
        } else {
          // Image failed to load, mark as placeholder
          console.log(`Failed to preload image: ${src}`);
        }
      });
    });
    
    // Log preloading activity - useful for debugging
    console.log(`Preloading ${imagesToPreloadNow.length} images for upcoming products`);
  }, [products, visibleStart, visibleEnd, prefetchCount]);

  // This component doesn't render anything visible
  return null;
}