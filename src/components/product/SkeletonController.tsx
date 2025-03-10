// src/components/product/SkeletonController.tsx
import React, { useMemo } from 'react';
import SkeletonProductCard from './SkeletonProductCard';
import { SkeletonRenderOptions } from '@/types';

interface SkeletonControllerProps {
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  isRenderingEdges: boolean; 
  columnCount: number;
  visibleSkeletonPages: number[];
  options?: Partial<SkeletonRenderOptions>;
}

/**
 * SkeletonController manages the rendering of skeleton cards
 * for different loading states in a more efficient way
 */
export default function SkeletonController({
  isInitialLoading, 
  isLoadingMore,
  isRenderingEdges,
  columnCount,
  visibleSkeletonPages,
  options = {}
}: SkeletonControllerProps) {
  // Default options
  const {
    skeletonCount = 12,
    loadMoreSkeletonCount = 6,
    totalSkeletonPages = 5,
    initialAnimated = true,
    loadMoreAnimated = true
  } = options;
  
  // Generate skeleton cards for different scenarios
  const skeletons = useMemo(() => {
    // Initial loading skeletons (shown when app first loads)
    const initialSkeletons = Array(skeletonCount).fill(0).map((_, i) => (
      <div key={`skeleton-initial-${i}`} className="h-full">
        <SkeletonProductCard animated={initialAnimated} />
      </div>
    ));
    
    // Load more skeletons (shown at bottom during pagination)
    const loadMoreSkeletons = Array(loadMoreSkeletonCount).fill(0).map((_, i) => (
      <div key={`skeleton-more-${i}`} className="h-full">
        <SkeletonProductCard animated={loadMoreAnimated} />
      </div>
    ));
    
    // Pre-rendered skeleton pages for infinite scroll
    const skeletonPages = Array(totalSkeletonPages).fill(0).map((_, pageIndex) => {
      // Only render pages that are in the visible skeleton pages array
      const isPageVisible = visibleSkeletonPages.includes(pageIndex);
      
      if (!isPageVisible && !isInitialLoading) {
        return null; // Skip rendering this page
      }
      
      return (
        <React.Fragment key={`skeleton-page-${pageIndex}`}>
          {Array(skeletonCount).fill(0).map((_, i) => (
            <div 
              key={`skeleton-page-${pageIndex}-item-${i}`} 
              className="h-full" 
              style={{ 
                display: isInitialLoading ? 'block' : (isPageVisible ? 'block' : 'none')
              }}
              data-skeleton-page={pageIndex}
              data-skeleton-index={i}
            >
              <SkeletonProductCard animated={initialAnimated && pageIndex === 0} />
            </div>
          ))}
        </React.Fragment>
      );
    });
    
    return {
      initialSkeletons,
      loadMoreSkeletons,
      skeletonPages: skeletonPages.filter(Boolean)
    };
  }, [
    skeletonCount, 
    loadMoreSkeletonCount, 
    totalSkeletonPages, 
    visibleSkeletonPages, 
    initialAnimated, 
    loadMoreAnimated,
    isInitialLoading
  ]);

  // Decide what to render based on current state
  if (isInitialLoading) {
    return <>{skeletons.initialSkeletons}</>;
  }
  
  return (
    <>
      {/* Pre-rendered skeleton pages for quick loading during scroll */}
      {skeletons.skeletonPages}
      
      {/* Loading more skeletons at bottom */}
      {isLoadingMore && skeletons.loadMoreSkeletons}
    </>
  );
}