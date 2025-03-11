// src/app/page.tsx - Main integration
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, List, Grid, AlertCircle, RefreshCw, X } from 'lucide-react';

// Custom hooks
import { useProducts } from '@/hooks/useProducts';
import { usePreloadData } from '@/hooks/usePreloadData';
import { useVirtualization } from '@/hooks/useVirtualization';

// Components
import FilterPanel from '@/components/product/FilterPanel'; 
import ProductCard from '@/components/product/ProductCard';
import ProductDetailsModal from '@/components/product/ProductDetailsModal';
import SplashScreen from '@/components/layout/SplashScreen';
import DynamicProductGrid from '@/components/product/DynamicProductGrid';
import SkeletonProductCard from '@/components/product/SkeletonProductCard';

// Import types
import { Product, LoadingState, DebugStateMonitorProps } from '@/types';

// Debug component with explicit typing
function DebugStateMonitor({ 
  products, 
  loadingState, 
  setLoadingState, 
  initialLoading, 
  setInitialLoading, 
  showSplashScreen,
  loading 
}: DebugStateMonitorProps) {
  useEffect(() => {
    if (showSplashScreen) return;
    
    if (products.length > 0 && loadingState === 'loading') {
      console.warn('Invalid state detected: Products loaded but still in loading state');
      setLoadingState('loaded'); // Direct state update
    }
    
    if (products.length > 0 && initialLoading) {
      console.warn('Invalid state detected: Products loaded but still in initialLoading state');
      setInitialLoading(false); // Direct state update
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
    ensureLoadedState
  } = useProducts();
  
  // Force products loading state - explicit override
  const [forceShowProducts, setForceShowProducts] = useState(false);

  const loaderRef = useRef<HTMLDivElement>(null);
  
  // Define a local setLoadingState function if not provided by the hook
  const setLoadingState = useCallback((state: LoadingState) => {
    // This is a workaround if your hook doesn't expose setLoadingState
    console.log('Setting loading state to:', state);
    if (typeof ensureLoadedState === 'function') {
      ensureLoadedState();
    }
    
    // Force showing products regardless of loading state
    if (state === 'loaded' && products.length > 0) {
      setForceShowProducts(true);
    }
  }, [ensureLoadedState, products.length]);
  
  // Preload data during splash screen
  const { showSplashScreen, preloadData, preloadedData } = usePreloadData({
    onProductsLoaded: (loadedProducts) => {
      // This will be called when products are preloaded
      console.log(`Received ${loadedProducts.length} preloaded products`);
    }
  });
  
  // Calculate column count based on screen size
  const [columnCount, setColumnCount] = useState(3);
  
  useEffect(() => {
    const updateColumnCount = () => {
      if (window.innerWidth >= 1024) {
        setColumnCount(3); // lg
      } else if (window.innerWidth >= 640) {
        setColumnCount(2); // sm
      } else {
        setColumnCount(1); // mobile
      }
    };
    
    updateColumnCount(); // Initial calculation
    window.addEventListener('resize', updateColumnCount);
    
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);
  
  // Setup infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current || !hasMore || loading) return;
    
    // Store reference to current loader element
    const currentLoaderRef = loaderRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );
    
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }
    
    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [hasMore, loading, loadMoreProducts]);
  
  // Enhanced virtualization with skeleton page management
  const { 
    visibleWindow, 
    visibleSkeletonPages 
  } = useVirtualization({
    items: products,
    itemHeight: 350, // Approximate card height
    columnCount,
    skeletonPageSize: 12, // 4 rows of 3 columns
    totalSkeletonPages: 5 // Pre-render 5 pages of skeletons
  });
  
  // Handle preloaded data when splash screen ends
  useEffect(() => {
    if (!showSplashScreen && preloadedData && products.length === 0) {
      console.log('Applying preloaded data after splash screen');
      loadProducts(1, true);
    }
  }, [showSplashScreen, preloadedData, products.length, loadProducts]);
  
  // Force products to load properly - BEFORE any conditional return
  useEffect(() => {
    if (products.length > 0) {
      console.log('Products detected, ensuring loaded state');
      setLoadingState('loaded');
      setInitialLoading(false);
      setForceShowProducts(true);
      
      if (typeof ensureLoadedState === 'function') {
        ensureLoadedState();
      }
    }
  }, [products.length, setLoadingState, setInitialLoading, ensureLoadedState]);
  
  // Always log product state for debugging
  useEffect(() => {
    console.log('Products state:', {
      count: products.length,
      loadingState,
      initialLoading,
      loading,
      forceShowProducts
    });
  }, [products.length, loadingState, initialLoading, loading, forceShowProducts]);
  
  // Retry loading on error
  const handleRetry = () => {
    loadProducts(1, true);
  };
  
  // Store splash screen visibility in a variable instead of doing an early return
  const isSplashScreenVisible = showSplashScreen;
  
  // Render content based on splash screen state
  if (isSplashScreenVisible) {
    return <SplashScreen onPreload={preloadData} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Debug State Monitor */}
      <DebugStateMonitor
        products={products}
        loadingState={loadingState}
        setLoadingState={setLoadingState}
        initialLoading={initialLoading}
        setInitialLoading={setInitialLoading}
        showSplashScreen={showSplashScreen} 
        loading={loading}      
      />
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
        <div className="relative w-full md:w-96">
          {/* Shadcn UI doesn't support icon prop directly, so we need to position it manually */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search wines and spirits..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full pl-10" // Add left padding to make room for the icon
            />
            {filters.search && (
              <button 
                onClick={() => updateFilters({ search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 hover:text-gray-700"
                type="button"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select 
            value={`${sort.field}:${sort.order}`}
            onValueChange={(value) => handleSortChange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price:desc">Price: High to Low</SelectItem>
              <SelectItem value="price:asc">Price: Low to High</SelectItem>
              <SelectItem value="name:asc">Name: A-Z</SelectItem>
              <SelectItem value="name:desc">Name: Z-A</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={showFilters ? "wine" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} className="mr-2" />
            Filter
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List size={18} className="mr-2" /> : <Grid size={18} className="mr-2" />}
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
            variant="destructive"
            onClick={handleRetry}
          >
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </Button>
        </div>
      )}
      
      {/* Product Count */}
      <div className="mb-6">
        <p className="text-neutral-600">
          {pagination?.total || 0} products found
          {products.length > 0 && pagination && products.length < pagination.total && 
            ` (showing ${products.length})`}
        </p>
      </div>
      
      {/* Product grid using the DynamicProductGrid component */}
      {initialLoading && products.length === 0 ? (
        <DynamicProductGrid
          products={[]}
          onProductClick={() => {}}
          loading={true}
          initialLoading={true}
          showSkeletons={true}
          visibleWindow={visibleWindow}
        />
      ) : products.length > 0 || forceShowProducts ? (
<DynamicProductGrid
  products={products}
  onProductClick={(product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  }}
  loading={loading}
  initialLoading={false}
  loaderRef={loaderRef}
  visibleWindow={visibleWindow}
/>
      ) : (
        <DynamicProductGrid
          products={[]}
          onProductClick={() => {}}
          loading={loading}
          initialLoading={initialLoading}
          showSkeletons={true}
          visibleWindow={visibleWindow}
        />
      )}
      
      {/* Product Details Modal */}
      <ProductDetailsModal 
        product={selectedProduct} 
        visible={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
      
      {/* No results indicator */}
      {!loading && products.length === 0 && !error && !initialLoading && (
        <div className="text-center py-16 bg-neutral-50 rounded-lg border border-neutral-200">
          <h4 className="text-neutral-700 text-lg font-medium">No products found</h4>
          <p className="text-neutral-600">Try adjusting your search criteria or filters</p>
        </div>
      )}
      
      {/* Debug Tools (can be removed in production) */}
      <div className="fixed bottom-4 right-4 z-10">
        <Button 
          variant="outline"
          size="sm"
          onClick={clearCache}
          className="text-xs opacity-50 hover:opacity-100"
        >
          Clear Cache
        </Button>
      </div>
      
      {/* Force Load Button - useful for debugging, can be removed in production */}
      <div className="fixed bottom-4 left-4 z-10">
        <Button
          variant="wine"
          size="sm"
          onClick={() => {
            console.log('Manual force load');
            setLoadingState('loaded');
            setInitialLoading(false);
            setForceShowProducts(true);
            if (typeof ensureLoadedState === 'function') {
              ensureLoadedState();
            }
          }}
          className="text-xs"
        >
          Force Show Products
        </Button>
      </div>
    </div>
  );
}