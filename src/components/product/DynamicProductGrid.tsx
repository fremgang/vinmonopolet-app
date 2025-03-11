// src/components/product/ProductGrid.tsx
import React, { useEffect, useState, useRef } from 'react';
import ProductCard from './ProductCard';
import SkeletonProductCard from './SkeletonProductCard';
import { Product } from '@/types';
import imageService, { ImageSize } from '@/services/imageService';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  loaderRef?: React.RefObject<HTMLDivElement>;
  visibleWindow?: { start: number; end: number; itemCount: number };
  loading?: boolean;
  initialLoading?: boolean;
  showSkeletons?: boolean;
  imageSize?: ImageSize;
  useWebP?: boolean;
}

export default function ProductGrid({ 
  products, 
  onProductClick,
  loaderRef,
  visibleWindow,
  loading = false,
  initialLoading = false,
  showSkeletons = true,
  imageSize = 'small',
  useWebP = true
}: ProductGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [minCardWidth, setMinCardWidth] = useState(300); // Larger minimum card width
  const [gridGap, setGridGap] = useState(20); // Default gap
  const [imageLoadingCount, setImageLoadingCount] = useState(0);

  // Track image preloading
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    // Preload first 6 images for above the fold content
    const preloadImages = async () => {
      setImageLoadingCount(prevCount => prevCount + 6);
      
      try {
        const preloadPromises = products.slice(0, 6).map(product => {
          return new Promise<void>((resolve) => {
            if (!product.imageMain) {
              resolve();
              return;
            }
            
            const img = new Image();
            img.onload = () => {
              setImageLoadingCount(prevCount => Math.max(0, prevCount - 1));
              resolve();
            };
            img.onerror = () => {
              setImageLoadingCount(prevCount => Math.max(0, prevCount - 1));
              resolve();
            };
            img.src = imageService.getProductImageUrl(product, { size: imageSize, format: useWebP ? 'webp' : 'jpg' });
          });
        });
        
        await Promise.allSettled(preloadPromises);
      } catch (err) {
        console.error('Error preloading images:', err);
      }
    };
    
    preloadImages();
  }, [products, imageSize, useWebP]);

  // Calculate optimal grid layout
  useEffect(() => {
    if (!gridRef.current) return;
    
    // Store reference to current grid element
    const currentGridRef = gridRef.current;

    const calculateGridLayout = () => {
      const containerWidth = currentGridRef?.clientWidth || 1200;
      
      // Determine minimum card width based on container size
      let optimalMinWidth = 340; // Larger default minimum width
      
      // Make cards smaller on small screens
      if (containerWidth < 640) {
        optimalMinWidth = 280; // Larger on mobile
      } else if (containerWidth < 1024) {
        optimalMinWidth = 320; // Larger on tablets
      }
      
      setMinCardWidth(optimalMinWidth);
      setGridGap(containerWidth < 640 ? 12 : 20); // Smaller gaps on mobile
    };

    // Initial calculation
    calculateGridLayout();
    
    // Calculate on resize
    const resizeObserver = new ResizeObserver(() => {
      // Throttle resize calculations with requestAnimationFrame
      window.requestAnimationFrame(calculateGridLayout);
    });
    
    resizeObserver.observe(currentGridRef);
    
    return () => {
      resizeObserver.unobserve(currentGridRef);
    };
  }, []);

  // Handle virtualized rendering if visibleWindow is provided
  const visibleProducts = React.useMemo(() => {
    if (!visibleWindow) return products;
    return products.slice(visibleWindow.start, visibleWindow.end + 1);
  }, [products, visibleWindow]);
  
  // Generate skeleton placeholders for loading state
  const createSkeletonCards = (count: number) => {
    return Array(count).fill(0).map((_, index) => (
      <div 
        key={`skeleton-${index}`}
        style={{ 
          margin: '0 auto', 
          width: '100%'
        }}
      >
        <SkeletonProductCard animated={true} />
      </div>
    ));
  };
  
  // Determine number of skeleton cards based on viewport width
  const getSkeletonCount = () => {
    if (typeof window !== 'undefined') {
      // Base the skeleton count on the approximate number of visible columns
      const viewportWidth = window.innerWidth;
      
      // Roughly estimate how many columns would fit
      const estimatedColumns = Math.floor(viewportWidth / (minCardWidth + gridGap));
      
      // Create enough skeletons for 4 rows
      return Math.max(4, estimatedColumns) * 4;
    }
    return 12; // Default fallback
  };

  if (initialLoading && showSkeletons) {
    // Show skeleton grid for initial loading
    return (
      <div className="w-full" ref={gridRef}>
        <div 
          className="grid mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth + 40}px, 1fr))`,
            gap: `${gridGap}px`,
            width: '100%'
          }}
        >
          {createSkeletonCards(getSkeletonCount())}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" ref={gridRef}>
      <div 
        className="grid mx-auto"
        style={{ 
          gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth + 40}px, 1fr))`,
          gap: `${gridGap}px`,
          width: '100%'
        }}
      >
        {visibleProducts.map((product, index) => (
          <div 
            key={product.product_id} 
            style={{ margin: '0 auto', width: '100%' }}
          >
            <ProductCard 
              product={product}
              onClick={() => onProductClick(product)}
              isPriority={index < 9} // Prioritize first 9 images for above the fold
              imageSize={imageSize}
              useWebP={useWebP}
            />
          </div>
        ))}
        
        {/* Show skeleton loaders at the end if loading more */}
        {loading && !initialLoading && showSkeletons && (
          <>
            {createSkeletonCards(Math.max(2, Math.floor(getSkeletonCount() / 4)))}
          </>
        )}
      </div>
      
      {/* Image preloading indicator (only visible in development) */}
      {process.env.NODE_ENV === 'development' && imageLoadingCount > 0 && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-xs">
          Preloading {imageLoadingCount} images...
        </div>
      )}
      
      {/* Loader for infinite scroll */}
      {loaderRef && (
        <div ref={loaderRef} className="h-20 w-full mt-4" id="infinite-scroll-marker"></div>
      )}
    </div>
  );
}