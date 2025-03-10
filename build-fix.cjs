// build-fix.js (CommonJS version)
const fs = require('fs');
const path = require('path');

// Helper to create directory if it doesn't exist
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    console.log(`Creating directory: ${directory}`);
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Create necessary component directories
console.log('Setting up component directories...');
const componentsDir = path.join(__dirname, 'src', 'components');
ensureDirectoryExists(componentsDir);
ensureDirectoryExists(path.join(componentsDir, 'product'));
ensureDirectoryExists(path.join(componentsDir, 'layout'));

// Create necessary hooks directories
console.log('Setting up hooks directory...');
const hooksDir = path.join(__dirname, 'src', 'hooks');
ensureDirectoryExists(hooksDir);

// Create types directory
console.log('Setting up types directory...');
const typesDir = path.join(__dirname, 'src', 'types');
ensureDirectoryExists(typesDir);

// Create utils directory
console.log('Setting up utils directory...');
const utilsDir = path.join(__dirname, 'src', 'utils');
ensureDirectoryExists(utilsDir);

// Verify that usePreloadData.ts exists in hooks directory
const preloadDataPath = path.join(hooksDir, 'usePreloadData.ts');
if (!fs.existsSync(preloadDataPath)) {
  console.log(`Creating usePreloadData.ts at ${preloadDataPath}`);
  
  const preloadDataContent = `// src/hooks/usePreloadData.ts
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
      const response = await fetch(\`/api/products?\${queryParams.toString()}\`, {
        // Add cache: 'no-store' to ensure fresh data
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        console.log(\`Preloaded \${data.products.length} products during splash screen\`);
        
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
}`;

  fs.writeFileSync(preloadDataPath, preloadDataContent);
}

console.log('Directory structure setup complete!');