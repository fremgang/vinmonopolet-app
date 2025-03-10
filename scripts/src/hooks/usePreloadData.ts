// src/hooks/usePreloadData.ts
import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';

interface PreloadDataOptions {
  splashScreenDuration?: number; // in milliseconds
  onProductsLoaded?: (products: Product[]) => void;
}

export function usePreloadData({
  splashScreenDuration = 5000,
  onProductsLoaded = () => {}
}: PreloadDataOptions = {}) {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [preloadComplete, setPreloadComplete] = useState(false);
  const [preloadedData, setPreloadedData] = useState<{
    products: Product[];
    pagination: any;
  } | null>(null);

  // Preload data during splash screen
  const preloadData = useCallback(async () => {
    try {
      console.log('Starting preload during splash screen');
      
      // Start fetching random data during splash screen
      const queryParams = new URLSearchParams({
        random: 'true',
        limit: '50'
      });
      
      // Prefetch random products (will be cached)
      const response = await fetch(`/api/products?${queryParams.toString()}`, {
        // Add cache: 'no-store' to ensure fresh data
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        console.log(`Preloaded ${data.products.length} products during splash screen`);
        
        // Store the preloaded data
        setPreloadedData(data);
        
        // Start loading product images
        const imagePromises = data.products.slice(0, 9).map((product: Product) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve; // Still resolve on error to not block
            img.src = product.imageMain;
          });
        });
        
        // Wait for the first few images to load
        await Promise.allSettled(imagePromises);
        
        // Notify that preload is complete
        setPreloadComplete(true);
        
        // Notify parent component of loaded products
        onProductsLoaded(data.products);
        
        console.log('Preload completed successfully');
        return true;
      } else {
        console.error('Failed to preload: API response not ok');
        setPreloadComplete(true); // Still mark as complete to not block
        return false;
      }
    } catch (err) {
      console.error('Error during preload:', err);
      setPreloadComplete(true); // Still mark as complete to not block
      return false;
    }
  }, [onProductsLoaded]);

  // Hide splash screen after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplashScreen(false);
    }, splashScreenDuration);
    
    return () => clearTimeout(timer);
  }, [splashScreenDuration]);

  return {
    showSplashScreen,
    preloadComplete,
    preloadedData,
    preloadData
  };
}