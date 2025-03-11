// src/app/page.tsx - Ref fix
'use client';

import React, { useRef, useState } from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { useVirtualization } from '@/hooks/useVirtualization';
import { Product } from '@/types';

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Products and loading state from custom hook
  const { 
    products,
    loading,
    initialLoading,
    hasMore,
    loadMoreProducts,
  } = useProducts();
  
  // Define loader ref with proper type
  const loaderRef = useRef<HTMLDivElement>(null);
  
  // Enhanced virtualization with skeleton page management
  const { 
    visibleWindow, 
    visibleSkeletonPages 
  } = useVirtualization({
    items: products,
    itemHeight: 350,
    columnCount: 3,
    skeletonPageSize: 12,
    totalSkeletonPages: 5
  });

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Other UI elements */}
      
      <ProductGrid
        products={products}
        onProductClick={(product) => {
          setSelectedProduct(product);
          setModalOpen(true);
        }}
        loaderRef={loaderRef}
        loading={loading}
        initialLoading={initialLoading}
        visibleWindow={visibleWindow}
        imageSize="small"
        useWebP={true}
      />
      
      {/* Other UI elements */}
    </div>
  );
}