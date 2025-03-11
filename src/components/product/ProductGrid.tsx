// src/components/product/ProductGrid.tsx
import React, { useEffect, useState, useRef } from 'react';
import ProductCard from './ProductCard';
import SkeletonProductCard from './SkeletonProductCard';
import { Product } from '@/types';
import imageService, { ImageSize } from '@/services/imageService';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  loaderRef?: React.RefObject<HTMLDivElement | null>; // Fix: allow null
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
  const [minCardWidth, setMinCardWidth] = useState(300);
  const [gridGap, setGridGap] = useState(20);
  const [imageLoadingCount, setImageLoadingCount] = useState(0);

  // Rest of component code...

  return (
    <div className="w-full" ref={gridRef}>
      {/* Component rendering logic */}
      
      {/* Loader for infinite scroll */}
      {loaderRef && (
        <div ref={loaderRef} className="h-20 w-full mt-4" id="infinite-scroll-marker"></div>
      )}
    </div>
  );
}