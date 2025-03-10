// src/hooks/useVirtualization.ts
import { useState, useEffect, useCallback } from 'react';

interface UseVirtualizationOptions<T> {
  items: T[];
  itemHeight?: number;
  overscan?: number;
}

interface VirtualItem {
  index: number;
  start: number;
  end: number;
  size: number;
  visible: boolean;
}

export function useVirtualization<T>({
  items,
  itemHeight = 350, // Default height in pixels
  overscan = 5 // Number of items to render before and after visible items
}: UseVirtualizationOptions<T>) {
  const [visibleWindow, setVisibleWindow] = useState({ start: 0, end: 30 });
  const [scrollPosition, setScrollPosition] = useState(0);

  // Calculate virtual items based on scroll position
  const calculateVisibleRange = useCallback(() => {
    const scrollY = window.scrollY;
    setScrollPosition(scrollY);
    
    // Calculate which items should be visible based on scroll position
    const rowsPerScreen = Math.ceil(window.innerHeight / itemHeight) + 1;
    const buffer = rowsPerScreen * overscan; // Extra buffer for smooth scrolling
    
    // For grid layouts, need to account for multiple columns
    // This assumes 3 columns on desktop - would need to be more dynamic in a real app
    const columnsCount = window.innerWidth >= 1024 ? 3 : (window.innerWidth >= 640 ? 2 : 1);
    
    const scrollItemIndex = Math.floor(scrollY / itemHeight) * columnsCount;
    const startVisible = Math.max(0, scrollItemIndex - buffer * columnsCount);
    const endVisible = Math.min(
      items.length - 1, 
      scrollItemIndex + rowsPerScreen * columnsCount + buffer * columnsCount
    );
    
    setVisibleWindow({
      start: startVisible,
      end: endVisible
    });
  }, [items.length, itemHeight, overscan]);

  // Handle scroll events
  useEffect(() => {
    // Initial calculation
    calculateVisibleRange();
    
    // Attach scroll event listener
    window.addEventListener('scroll', calculateVisibleRange);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', calculateVisibleRange);
    };
  }, [calculateVisibleRange, items.length]);
  
  // Create virtual items array
  const virtualItems: VirtualItem[] = items.map((_, index) => {
    const visible = index >= visibleWindow.start && index <= visibleWindow.end;
    
    return {
      index,
      start: index * itemHeight,
      end: (index + 1) * itemHeight,
      size: itemHeight,
      visible
    };
  }).filter(item => item.visible);
  
  // For debugging virtual rendering
  useEffect(() => {
    console.log(`Rendering ${virtualItems.length} items out of ${items.length} total`);
  }, [virtualItems.length, items.length]);

  return {
    visibleWindow,
    scrollPosition,
    virtualItems,
    calculateVisibleRange
  };
}