// src/components/ImagePreloader.tsx
import React, { useEffect, useState } from 'react';
import type { Product } from '@/app/page';

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
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!products || products.length === 0) return;
    
    // Calculate range of images to preload
    const startIndex = visibleEnd;
    const endIndex = Math.min(startIndex + prefetchCount, products.length);
    const imagesToPreload: string[] = [];
    
    // Collect image URLs to preload
    for (let i = startIndex; i < endIndex; i++) {
      const product = products[i];
      if (!product) continue;
      
      if (product.imageSmall && !loadedImages.has(product.imageSmall)) {
        imagesToPreload.push(product.imageSmall);
      }
      
      // Don't preload the main (larger) image unless specifically needed
      // to avoid overloading the browser
    }
    
    // Create image objects to preload
    const preloadPromises = imagesToPreload.map(src => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(src);
        img.src = src;
      });
    });
    
    // Track loaded images
    Promise.allSettled(preloadPromises).then(results => {
      const newLoadedImages = new Set(loadedImages);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          newLoadedImages.add(result.value);
        }
      });
      
      setLoadedImages(newLoadedImages);
    });
    
    // Log preloading activity - useful for debugging
    console.log(`Preloading ${imagesToPreload.length} images for upcoming products`);
  }, [products, visibleStart, visibleEnd, prefetchCount, loadedImages]);

  // This component doesn't render anything visible
  return null;
}