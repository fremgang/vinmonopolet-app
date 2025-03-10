// src/components/product/ProductGrid.tsx
import React, { useMemo } from 'react';
import ProductCard from './ProductCard';
import SkeletonController from './SkeletonController';
import { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  initialLoading: boolean;
  loadingState: 'loading' | 'loaded';
  hasMore: boolean;
  visibleWindow?: { start: number; end: number; itemCount: number };
  visibleSkeletonPages?: number[];
  columnCount?: number;
  onProductClick: (product: Product) => void;
  loaderRef: React.RefObject<HTMLDivElement | null>;
  skeletonOptions?: {
    skeletonCount?: number;
    loadMoreSkeletonCount?: number;
    totalSkeletonPages?: number;
  };
}

export default function ProductGrid({
  products,
  loading,
  initialLoading,
  loadingState,
  hasMore,
  visibleWindow = { start: 0, end: 50, itemCount: 0 },
  visibleSkeletonPages = [0, 1], // Default to first two pages
  columnCount = 3,
  onProductClick,
  loaderRef,
  skeletonOptions = {}
}: ProductGridProps) {
  // Determine if we should show skeletons at the bottom
  const showBottomSkeletons = loading && !initialLoading && hasMore;
  
  // Determine if we're rendering edge skeletons
  const showEdgeSkeletons = loadingState === 'loading' && products.length > 0;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Skeleton Controller handles all skeleton rendering efficiently */}
        <SkeletonController 
          isInitialLoading={initialLoading && products.length === 0}
          isLoadingMore={showBottomSkeletons}
          isRenderingEdges={showEdgeSkeletons}
          columnCount={columnCount}
          visibleSkeletonPages={visibleSkeletonPages}
          options={skeletonOptions}
        />
        
        {/* Products content with virtualization */}
        {!initialLoading && products.map((product, index) => {
  // Virtualization logic
  if (index < visibleWindow.start || index > visibleWindow.end) {
    return (
      <div 
        key={`placeholder-${product.product_id}`}
        className="h-[350px]" 
        aria-hidden="true"
      />
    );
  }
          
          // Check if product is at the edge of our window - if so, render skeleton for smooth transitions
          const isEdgeItem = (index >= visibleWindow.end - 9 && index <= visibleWindow.end) || 
                            (index >= visibleWindow.start && index <= visibleWindow.start + 9);
                            
          if (isEdgeItem && showEdgeSkeletons) {
            return (
              <div key={`skeleton-edge-${index}`} className="h-full">
                <ProductCard 
                  product={product}
                  onClick={() => onProductClick(product)}
                  isLoading={true} // Pass loading state to ProductCard
                />
              </div>
            );
          }
          
          // Render normal product
          return (
            <div 
              key={product.product_id}
              className="h-full opacity-100" // Always visible
            >
              <ProductCard 
                product={product}
                onClick={() => onProductClick(product)}
              />
            </div>
          );
        })}
      </div>
      
      {/* Infinite Scroll Loader */}
      {hasMore && (
        <div 
          ref={loaderRef} 
          className="flex justify-center py-12"
        >
          {loading && !initialLoading && (
            <div className="loading">Loading more products...</div>
          )}
          {!loading && <div className="h-10" />}
        </div>
      )}
      
      {/* End of results indicator */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-8 text-neutral-500">
          End of results
        </div>
      )}
    </>
  );
}