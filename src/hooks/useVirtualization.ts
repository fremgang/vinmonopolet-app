// src/hooks/useVirtualization.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { VirtualizationOptions, VirtualItem, VirtualWindow } from '@/types';

export function useVirtualization<T>({
  items,
  itemHeight = 350, // Default height in pixels
  overscan = 5, // Number of items to render before and after visible items
  columnCount, // Dynamic column count based on screen size
  skeletonPageSize = 12, // Number of items per skeleton page
  totalSkeletonPages = 5 // Total number of skeleton pages to manage
}: VirtualizationOptions<T>) {
  // Track visible window for rendering
  const [visibleWindow, setVisibleWindow] = useState<VirtualWindow>({ 
    start: 0, 
    end: 30,
    itemCount: items.length
  });
  
  // Track scroll position
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Track which skeleton pages are currently visible
  const [visibleSkeletonPages, setVisibleSkeletonPages] = useState<number[]>([]);
  
  // Track current column count
  const [currentColumnCount, setCurrentColumnCount] = useState(3); // Default to desktop
  
  // Ref to track throttling
  const throttleTimerRef = useRef<number | null>(null);

  // Calculate column count based on screen width
  const calculateColumnCount = useCallback(() => {
    if (typeof window === 'undefined') return 3; // Default to desktop during SSR
    
    // Default column counts based on breakpoints
    // These should match your Tailwind breakpoints in the grid
    if (window.innerWidth >= 1024) return 3; // lg
    if (window.innerWidth >= 640) return 2; // sm
    return 1; // mobile
  }, []);

  // Calculate which items should be visible based on scroll position
  const calculateVisibleRange = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const scrollY = window.scrollY;
    setScrollPosition(scrollY);
    
    // Update column count
    const columns = calculateColumnCount();
    setCurrentColumnCount(columns);
    
    // Calculate which items should be visible based on scroll position
    const rowsPerScreen = Math.ceil(window.innerHeight / itemHeight) + 1;
    const buffer = rowsPerScreen * overscan; // Extra buffer for smooth scrolling
    
    // Calculate the row index based on scroll position
    const currentRowIndex = Math.floor(scrollY / itemHeight);
    
    // Calculate the starting item index for the current row
    const startItemIndex = Math.max(0, (currentRowIndex - buffer) * columns);
    
    // Calculate the ending item index
    const endItemIndex = Math.min(
      items.length - 1, 
      (currentRowIndex + rowsPerScreen + buffer) * columns
    );
    
    // Update visible window
    setVisibleWindow({
      start: startItemIndex,
      end: endItemIndex,
      itemCount: items.length
    });
    
    // Calculate which skeleton pages should be visible
    // Each skeleton page contains skeletonPageSize items
    const visibleStartPage = Math.floor(startItemIndex / skeletonPageSize);
    const visibleEndPage = Math.ceil(endItemIndex / skeletonPageSize);
    
    // Calculate which skeleton pages should be displayed
    const newVisiblePages = [];
    for (let i = visibleStartPage; i <= Math.min(visibleEndPage, totalSkeletonPages - 1); i++) {
      newVisiblePages.push(i);
    }
    
    setVisibleSkeletonPages(newVisiblePages);
  }, [items.length, itemHeight, overscan, skeletonPageSize, totalSkeletonPages, calculateColumnCount]);

  // Throttled scroll handler to prevent too many calculations
  const handleScroll = useCallback(() => {
    if (throttleTimerRef.current !== null) return;
    
    throttleTimerRef.current = window.setTimeout(() => {
      calculateVisibleRange();
      throttleTimerRef.current = null;
    }, 100); // Throttle to 100ms
  }, [calculateVisibleRange]);

  // Handle resize events
  const handleResize = useCallback(() => {
    if (throttleTimerRef.current !== null) {
      clearTimeout(throttleTimerRef.current);
    }
    
    throttleTimerRef.current = window.setTimeout(() => {
      calculateVisibleRange();
      throttleTimerRef.current = null;
    }, 100); // Throttle to 100ms
  }, [calculateVisibleRange]);

  // Set up event listeners
  useEffect(() => {
    // Initial calculation
    calculateVisibleRange();
    
    // Attach event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      
      if (throttleTimerRef.current !== null) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, [calculateVisibleRange, handleScroll, handleResize]);
  
  // Recalculate when items change
  useEffect(() => {
    calculateVisibleRange();
  }, [items.length, calculateVisibleRange]);

  // Create virtual items array for all items
  const virtualItems: VirtualItem[] = items.map((item, index) => {
    const rowIndex = Math.floor(index / currentColumnCount);
    const visible = index >= visibleWindow.start && index <= visibleWindow.end;
    
    return {
      index,
      start: rowIndex * itemHeight,
      end: (rowIndex + 1) * itemHeight,
      size: itemHeight,
      visible
    };
  });

  // For debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `Rendering ${virtualItems.filter(i => i.visible).length} items out of ${items.length} total`
      );
    }
  }, [virtualItems, items.length]);

  return {
    visibleWindow,
    scrollPosition,
    virtualItems: virtualItems.filter(item => item.visible),
    visibleSkeletonPages,
    columnCount: currentColumnCount,
    calculateVisibleRange
  };
}