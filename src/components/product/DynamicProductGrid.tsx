// src/components/product/DynamicProductGrid.tsx
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import ProductCard from './ProductCard';
import SkeletonProductCard from './SkeletonProductCard';
import { Product } from '@/types';

interface DynamicProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  loaderRef?: React.RefObject<HTMLDivElement>; // Correctly typed as RefObject<HTMLDivElement>
  visibleWindow?: { start: number; end: number; itemCount: number };
  loading?: boolean;
  initialLoading?: boolean;
  showSkeletons?: boolean;
}

export default function DynamicProductGrid({ 
  products, 
  onProductClick,
  loaderRef,
  visibleWindow,
  loading = false,
  initialLoading = false,
  showSkeletons = true,
}: DynamicProductGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(3);
  const [cardWidth, setCardWidth] = useState(280); // Default card width
  const [gridGap, setGridGap] = useState(20); // Default gap
  const minCardWidth = 240; // Minimum card width

  // Calculate optimal column count and card sizes
  useEffect(() => {
    if (!gridRef.current) return;
    
    // Store reference to current grid element
    const currentGridRef = gridRef.current;

    const calculateColumns = () => {
      const containerWidth = currentGridRef?.clientWidth || 1200;
      const maxCardWidth = 280; // Maximum card width
      const gap = 20; // Gap between cards
      
      // Calculate how many columns can fit with optimal sizing
      let possibleColumns = Math.floor((containerWidth + gap) / (minCardWidth + gap));
      
      // Ensure at least 2 columns and maximum of 8 columns
      // Increased minimum columns to 3 when space allows
      if (containerWidth > 768) {
        possibleColumns = Math.max(3, Math.min(8, possibleColumns));
      } else {
        possibleColumns = Math.max(2, Math.min(8, possibleColumns));
      }
      
      // Calculate the actual card width based on the column count
      let optimalCardWidth = Math.floor((containerWidth - (gap * (possibleColumns - 1))) / possibleColumns);
      
      // If the card would be too wide, add another column
      if (optimalCardWidth > maxCardWidth && possibleColumns < 8) {
        possibleColumns += 1;
        optimalCardWidth = Math.floor((containerWidth - (gap * (possibleColumns - 1))) / possibleColumns);
      }
      
      // Log for debugging
      console.log(`Grid: ${containerWidth}px width, ${possibleColumns} columns, ${optimalCardWidth}px per card`);
      
      setColumnCount(possibleColumns);
      setCardWidth(optimalCardWidth);
      setGridGap(gap);
    };

    // Initial calculation
    calculateColumns();
    
    // Calculate on resize
    const resizeObserver = new ResizeObserver(entries => {
      // Throttle resize calculations
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(calculateColumns);
      } else {
        setTimeout(calculateColumns, 66); // ~15fps
      }
    });
    
    resizeObserver.observe(currentGridRef);
    
    return () => {
      resizeObserver.unobserve(currentGridRef);
    };
  }, []);

  // Handle virtualized rendering if visibleWindow is provided
  const visibleProducts = useMemo(() => {
    if (!visibleWindow) return products;
    
    return products.slice(visibleWindow.start, visibleWindow.end + 1);
  }, [products, visibleWindow]);
  
  // Generate skeleton placeholders for loading state
  const createSkeletonCards = useCallback((count: number) => {
    return Array(count).fill(0).map((_, index) => (
      <div 
        key={`skeleton-${index}`}
        style={{ 
          margin: '0 auto', 
          width: '100%',
          // Match exact height of product cards
          minHeight: `${cardWidth * 1.4}px` 
        }}
      >
        <SkeletonProductCard animated={true} />
      </div>
    ));
  }, [cardWidth]);
  
  const skeletonCards = useMemo(() => {
    if (!showSkeletons || (!initialLoading && !loading)) return [];
    
    // Number of skeletons to show based on column count
    const skeletonCount = initialLoading ? columnCount * 4 : columnCount;
    return createSkeletonCards(skeletonCount);
  }, [columnCount, initialLoading, loading, showSkeletons, createSkeletonCards]);

  if (initialLoading && showSkeletons) {
    // Show skeleton grid for initial loading
    return (
      <div className="w-full" ref={gridRef}>
        <div 
          className="grid mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
            gap: `${gridGap}px`,
            width: '100%'
          }}
        >
          {createSkeletonCards(columnCount * 4)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" ref={gridRef}>
      <div 
        className="grid mx-auto"
        style={{ 
          gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
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
              isPriority={index < 6} // Add priority to first 6 images that will be above the fold
            />
          </div>
        ))}
        
        {/* Show skeleton loaders at the end if loading more */}
        {loading && !initialLoading && showSkeletons && skeletonCards}
      </div>
      
      {/* Loader for infinite scroll */}
      {loaderRef && (
        <div ref={loaderRef} className="h-20 w-full mt-4" id="infinite-scroll-marker"></div>
      )}
    </div>
  );
}