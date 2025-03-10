// src/components/product/ProductGrid.tsx
import React from 'react';
import ProductCard from './ProductCard';
import SkeletonProductCard from './SkeletonProductCard';
import { Product } from '@/hooks/useProducts';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  initialLoading: boolean;
  loadingState: 'loading' | 'loaded';
  hasMore: boolean;
  visibleWindow?: { start: number; end: number };
  onProductClick: (product: Product) => void;
  loaderRef: React.RefObject<HTMLDivElement>;
}

export default function ProductGrid({
  products,
  loading,
  initialLoading,
  loadingState,
  hasMore,
  visibleWindow = { start: 0, end: 50 },
  onProductClick,
  loaderRef
}: ProductGridProps) {
  // Skeleton cards for loading state
  const SkeletonArray = Array(9).fill(0).map((_, i) => (
    <div key={`skeleton-${i}`} className="h-full">
      <SkeletonProductCard />
    </div>
  ));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialLoading && products.length === 0 ? (
          // Show skeleton cards during initial loading
          <>{SkeletonArray}</>
        ) : (
          // Products content with virtualization
          products.map((product, index) => {
            // Create placeholder divs for items outside visible window to maintain scroll height
            if (index < visibleWindow.start || index > visibleWindow.end) {
              return (
                <div 
                  key={product.product_id}
                  className="h-[350px]" // Approximate height of a card
                />
              );
            }
            
            // Check if product is at the edge of our window - if so, render skeleton
            const isEdgeItem = (index >= visibleWindow.end - 9 && index <= visibleWindow.end) || 
                              (index >= visibleWindow.start && index <= visibleWindow.start + 9);
                              
            if (isEdgeItem && loadingState === 'loading') {
              return (
                <div key={`skeleton-edge-${index}`} className="h-full">
                  <SkeletonProductCard />
                </div>
              );
            }
            
            // Render normal product
            return (
              <div 
                key={product.product_id}
                className={`h-full transition-opacity duration-300 ${
                  loadingState === 'loaded' ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <ProductCard 
                  product={product}
                  onClick={() => onProductClick(product)}
                />
              </div>
            );
          })
        )}
        
        {/* Show skeleton cards at the end during "load more" */}
        {loading && !initialLoading && hasMore && (
          Array(3).fill(0).map((_, i) => (
            <div key={`skeleton-more-${i}`} className="h-full">
              <SkeletonProductCard />
            </div>
          ))
        )}
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