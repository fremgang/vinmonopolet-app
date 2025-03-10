// src/app/page.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Input, Select, Button, Text } from '@geist-ui/core';
import { Search, Filter, List, Grid, AlertCircle, RefreshCw } from 'lucide-react';

// Custom hooks
import { useProducts } from '@/hooks/useProducts';
import { usePreloadData } from '@/hooks/usePreloadData';
import { useVirtualization } from '@/hooks/useVirtualization';

// Components
import FilterPanel from '@/components/product/FilterPanel';
import ProductCard from '@/components/product/ProductCard';
import SkeletonProductCard from '@/components/product/SkeletonProductCard';
import ProductDetailsModal from '@/components/product/ProductDetailsModal';
import SplashScreen from '@/components/layout/SplashScreen';
import ProductGrid from '@/components/product/ProductGrid';

// Import types
import { Product, LoadingState, DebugStateMonitorProps } from '@/types';

// Debug component with explicit typing
function DebugStateMonitor({ 
  products, 
  loadingState, 
  setLoadingState, 
  initialLoading, 
  setInitialLoading, 
  showSplashScreen 
}: DebugStateMonitorProps) {
  useEffect(() => {
    if (showSplashScreen) return;
    
    if (products.length > 0 && loadingState === 'loading') {
      console.warn('Invalid state detected: Products loaded but still in loading state');
      setTimeout(() => setLoadingState('loaded'), 100);
    }
    
    if (products.length > 0 && initialLoading) {
      console.warn('Invalid state detected: Products loaded but still in initialLoading state');
      setTimeout(() => setInitialLoading(false), 100);
    }
  }, [products.length, loadingState, initialLoading, setLoadingState, setInitialLoading, showSplashScreen]);
  
  return null;
}

export default function Home() {
  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Products and loading state from custom hook
  const { 
    products,
    loading,
    initialLoading,
    loadingState,
    setInitialLoading,
    error,
    hasMore,
    pagination,
    filters,
    sort,
    loadProducts,
    loadMoreProducts,
    fetchRandomProducts,
    updateFilters,
    handleSortChange,
    clearCache,
    loaderRef
  } = useProducts();
  
  // Preload data during splash screen
  const { showSplashScreen, preloadData, preloadedData } = usePreloadData({
    onProductsLoaded: (loadedProducts) => {
      // This will be called when products are preloaded
      console.log(`Received ${loadedProducts.length} preloaded products`);
    }
  });
  
  // Handle preloaded data when splash screen ends
  useEffect(() => {
    if (!showSplashScreen && preloadedData && products.length === 0) {
      console.log('Applying preloaded data after splash screen');
      loadProducts(1, true);
    }
  }, [showSplashScreen, preloadedData, products.length, loadProducts]);
  
  // Get visible window from virtualization hook
  const { visibleWindow } = useVirtualization({
    items: products,
    itemHeight: 350 // Approximate card height
  });
  
  // Format price with Norwegian format
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `${new Intl.NumberFormat('no-NO').format(price)} kr`;
  };
  
  // Retry loading on error
  const handleRetry = () => {
    loadProducts(1, true);
  };
  
  // Render splash screen if showing
  if (showSplashScreen) {
    return <SplashScreen onPreload={preloadData} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Debug State Monitor */}
      <DebugStateMonitor
        products={products}
        loadingState={loadingState}
        setLoadingState={(state: LoadingState) => {
          // This is a simplified version for the example
          console.log(`Setting loading state to ${state}`);
        }}
        initialLoading={initialLoading}
        setInitialLoading={setInitialLoading}
        showSplashScreen={showSplashScreen}
      />
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
        <div className="relative w-full md:w-96">
          <Input
            icon={<Search />}
            placeholder="Search wines and spirits..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            width="100%"
            clearable
            crossOrigin={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            placeholder="Sort by"
            value={`${sort.field}:${sort.order}`}
            onChange={handleSortChange}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            <Select.Option value="price:desc">Price: High to Low</Select.Option>
            <Select.Option value="price:asc">Price: Low to High</Select.Option>
            <Select.Option value="name:asc">Name: A-Z</Select.Option>
            <Select.Option value="name:desc">Name: Z-A</Select.Option>
          </Select>
          
          <Button
            icon={<Filter size={18} />}
            auto
            onClick={() => setShowFilters(!showFilters)}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            placeholder={undefined}
            type={showFilters ? "success" : "default"}
            style={showFilters ? {backgroundColor: 'var(--wine-red)'} : {}}
          >
            Filter
          </Button>
          
          <Button
            icon={viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
            auto
            onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            placeholder={undefined}
          >
            {viewMode === 'grid' ? 'List' : 'Grid'}
          </Button>
        </div>
      </div>
      
      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 animate-fade-in">
          <FilterPanel 
            filters={filters} 
            onUpdateFilters={updateFilters} 
          />
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="p-6 mb-6 text-red-600 bg-red-50 rounded-md flex flex-col items-center">
          <div className="flex items-center mb-4">
            <AlertCircle className="mr-2" />
            <h3 className="text-lg font-medium">Error loading products</h3>
          </div>
          <p className="mb-4 text-center">{error}</p>
          <Button 
            icon={<RefreshCw size={16} />} 
            type="error" 
            onClick={handleRetry}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            placeholder={undefined}
          >
            Try Again
          </Button>
        </div>
      )}
      
      {/* Product Count */}
      <div className="mb-6">
        <Text p className="text-neutral-600">
          {pagination?.total || 0} products found
          {products.length > 0 && pagination && products.length < pagination.total && 
            ` (showing ${products.length})`}
        </Text>
      </div>
      
      {/* Product Grid Component */}
      <ProductGrid
        products={products}
        loading={loading}
        initialLoading={initialLoading}
        loadingState={loadingState}
        hasMore={hasMore}
        visibleWindow={visibleWindow}
        onProductClick={(product) => {
          setSelectedProduct(product);
          setModalOpen(true);
        }}
        loaderRef={loaderRef}
      />
      
      {/* Product Details Modal */}
      <ProductDetailsModal 
        product={selectedProduct} 
        visible={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
      
      {/* No results indicator */}
      {!loading && products.length === 0 && !error && !initialLoading && (
        <div className="text-center py-16 bg-neutral-50 rounded-lg border border-neutral-200">
          <Text h4 className="text-neutral-700">No products found</Text>
          <Text p className="text-neutral-600">Try adjusting your search criteria or filters</Text>
        </div>
      )}
      
      {/* Debug Tools (can be removed in production) */}
      <div className="fixed bottom-4 right-4 z-10">
        <Button 
          auto 
          scale={0.5} 
          type="secondary"
          onClick={clearCache}
          className="text-xs opacity-50 hover:opacity-100"
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          placeholder={undefined}
        >
          Clear Cache
        </Button>
      </div>
    </div>
  );
}