// src/app/page.tsx 
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Select, Button, Text, Loading } from '@geist-ui/core';
import { Search, Filter, List, Grid, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import FilterPanel from '@/components/FilterPanel';
import ProductCard from '@/components/ProductCard';
import SkeletonProductCard from '@/components/SkeletonProductCard';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import SplashScreen from '@/components/SplashScreen';
import Image from 'next/image';
import useProductCache from '@/hooks/useProductCache';
import ImagePreloader from '@/components/ImagePreloader';
import { Transition } from '@headlessui/react';

export interface Product {
  product_id: string;
  name: string;
  category: string | null;
  country: string | null;
  price: number | null;
  district: string | null;
  sub_district: string | null;
  producer: string | null;
  varetype: string | null;
  lukt: string | null;
  smak: string | null;
  farge: string | null;
  metode: string | null;
  inneholder: string | null;
  emballasjetype: string | null;
  korktype: string | null;
  utvalg: string | null;
  grossist: string | null;
  transportor: string | null;
  imageSmall: string;
  imageMain: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore: boolean;
}

// Create array of skeleton cards for loading state
const SkeletonArray = Array(9).fill(0).map((_, i) => (
  <div key={`skeleton-${i}`} className="h-full">
    <SkeletonProductCard />
  </div>
));

export default function Home() {
  // Show splash screen on initial load
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  
  // States for products and their display
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Product loading states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadedProducts, setLoadedProducts] = useState<Set<string>>(new Set());
  const [productTransitionState, setProductTransitionState] = useState<'loading' | 'loaded'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [page, setPage] = useState(1);
  
  // Track visible products for preloading
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  
  // Filter state
  const [filters, setFilters] = useState({
    countries: [] as string[],
    categories: [] as string[],
    priceRange: [0, 100000] as [number, number]
  });
  
  // Use our product cache hook
  const { 
    fetchProducts, 
    prefetchProducts, 
    loading: cacheLoading, 
    error: cacheError,
    clearCache
  } = useProductCache();
  
  // References for intersection observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  
  // Hide splash screen after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplashScreen(false);
    }, 5000); // 5 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset products when search or sort or filters change
  useEffect(() => {
    setProducts([]);
    setLoadedProducts(new Set());
    setProductTransitionState('loading');
    setPage(1);
    setHasMore(true);
    setPagination(null);
  }, [debouncedSearch, sortBy, sortOrder, filters]);

  // Main fetch function using the cache
  const loadProducts = useCallback(async (pageNum: number, reset = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Set loading state first
      setProductTransitionState('loading');
      
      // Fetch products using the cache
      const result = await fetchProducts(
        pageNum,
        debouncedSearch,
        sortBy,
        sortOrder,
        filters
      );
      
      // Update pagination info
      setPagination(result.pagination);
      setHasMore(result.pagination.hasMore);
      
      // Update products list - either replace or append
      setProducts(prev => {
        const newProducts = reset ? result.products : [...prev, ...result.products];
        
        // After a short delay, transition to the loaded state
        // This gives time for images to load and creates a smoother transition
        setTimeout(() => {
          setProductTransitionState('loaded');
        }, 300);
        
        return newProducts;
      });
      
      // After we load the current page, prefetch the next page
      if (result.pagination.hasMore) {
        prefetchProducts(
          pageNum,
          debouncedSearch,
          sortBy,
          sortOrder,
          filters
        );
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error loading products:', err);
        setError(err.message || 'Failed to load products. Please try again.');
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [debouncedSearch, sortBy, sortOrder, filters, loading, fetchProducts, prefetchProducts]);

  // Initial and filter-change data fetch
  useEffect(() => {
    if (!showSplashScreen) {
      loadProducts(1, true);
    }
  }, [debouncedSearch, sortBy, sortOrder, filters, loadProducts, showSplashScreen]);

  // Load more products
  const loadMoreProducts = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage);
  }, [hasMore, loading, page, loadProducts]);

  // Track when a product image has loaded successfully
  const handleProductLoaded = useCallback((productId: string) => {
    setLoadedProducts(prev => {
      const newSet = new Set(prev);
      newSet.add(productId);
      return newSet;
    });
  }, []);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!loaderRef.current) return;
    
    const currentLoaderRef = loaderRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(currentLoaderRef);
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadMoreProducts]);

  // Track visible products for preloading
  useEffect(() => {
    // Simple algorithm to determine currently visible products based on viewport
    const handleScroll = () => {
      const productElements = document.querySelectorAll('.product-card');
      if (!productElements.length) return;
      
      let startIndex = products.length;
      let endIndex = 0;
      
      productElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible) {
          startIndex = Math.min(startIndex, index);
          endIndex = Math.max(endIndex, index);
        }
      });
      
      if (startIndex <= endIndex) {
        setVisibleRange({ start: startIndex, end: endIndex });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial calculation
    setTimeout(handleScroll, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [products.length]);

  // Handle sort change
  const handleSortChange = (value: string | string[]) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    const [newSortBy, newSortOrder] = selectedValue.split(':');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };
  
  // Handle filter updates
  const handleUpdateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setShowFilters(false);
  };

  // Format price with Norwegian format
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `${new Intl.NumberFormat('no-NO').format(price)} kr`;
  };

  // Retry loading
  const handleRetry = () => {
    setError(null);
    loadProducts(1, true);
  };

  // Clear cache and reload
  const handleClearCache = () => {
    clearCache();
    setProducts([]);
    setPage(1);
    loadProducts(1, true);
  };

  // Render splash screen if showing
  if (showSplashScreen) {
    return <SplashScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
        <div className="relative w-full md:w-96">
          <Input
            icon={<Search />}
            placeholder="Search wines and spirits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            value={`${sortBy}:${sortOrder}`}
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
            onUpdateFilters={handleUpdateFilters} 
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
      
      {/* Active Filters Summary */}
      <div className="flex justify-between items-center mb-6">
        <Text p className="text-neutral-600">
          {pagination?.total || 0} products found
          {products.length > 0 && pagination && products.length < pagination.total && 
            ` (showing ${products.length})`}
        </Text>
        
        {(filters.countries.length > 0 || filters.categories.length > 0 || 
          filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-neutral-500">Active filters:</span>
            {filters.countries.map(country => (
              <span key={country} className="filter-chip">
                {country}
                <XCircle 
                  size={14} 
                  className="ml-1 cursor-pointer" 
                  onClick={() => handleUpdateFilters({
                    countries: filters.countries.filter(c => c !== country)
                  })}
                />
              </span>
            ))}
            {filters.categories.map(category => (
              <span key={category} className="filter-chip">
                {category}
                <XCircle 
                  size={14} 
                  className="ml-1 cursor-pointer" 
                  onClick={() => handleUpdateFilters({
                    categories: filters.categories.filter(c => c !== category)
                  })}
                />
              </span>
            ))}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) && (
              <span className="filter-chip">
                {filters.priceRange[0]} - {filters.priceRange[1] === 100000 ? 'No limit' : filters.priceRange[1]} NOK
              </span>
            )}
            <Button 
              auto 
              scale={1/3} 
              type="error"
              onClick={() => handleUpdateFilters({
                countries: [],
                categories: [],
                priceRange: [0, 100000]
              })}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              placeholder={undefined}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>
      
      {/* Product Grid/List Display with Skeleton Loading and Transition Effects */}
      {viewMode === 'grid' ? (
        // Grid View with skeleton loading
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialLoading ? (
            // Show skeleton cards during initial loading
            SkeletonArray
          ) : (
            // Show actual product cards with fade-in transition
            products.map(product => (
              <div 
                key={product.product_id}
                className="h-full transition-opacity duration-300"
              >
                <Transition
                  show={productTransitionState === 'loaded'}
                  enter="transition-opacity duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition-opacity duration-150"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <ProductCard 
                    product={product}
                    onClick={() => {
                      setSelectedProduct(product);
                      setModalOpen(true);
                    }}
                  />
                </Transition>
              </div>
            ))
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
      ) : (
        // List View with skeleton loading
        <div className="overflow-x-auto w-full bg-white border border-neutral-200 rounded-lg shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="p-4 text-left w-16">Image</th>
                <th className="p-4 text-left font-medium text-neutral-700">Name</th>
                <th className="p-4 text-left font-medium text-neutral-700 hidden md:table-cell">Category</th>
                <th className="p-4 text-left font-medium text-neutral-700 hidden md:table-cell">Country</th>
                <th className="p-4 text-left font-medium text-neutral-700">Price</th>
                <th className="p-4 text-right font-medium text-neutral-700">Availability</th>
              </tr>
            </thead>
            <tbody>
              {initialLoading ? (
                // Show skeleton rows during initial loading
                Array(5).fill(0).map((_, i) => (
                  <tr key={`skeleton-list-${i}`} className="border-b border-neutral-100">
                    <td className="p-4">
                      <div className="w-10 h-14 bg-neutral-200 rounded animate-pulse" />
                    </td>
                    <td className="p-4">
                      <div className="h-5 bg-neutral-200 rounded w-4/5 animate-pulse" />
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="h-4 bg-neutral-200 rounded w-2/3 animate-pulse" />
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="h-4 bg-neutral-200 rounded w-1/2 animate-pulse" />
                    </td>
                    <td className="p-4">
                      <div className="h-5 bg-neutral-200 rounded w-20 animate-pulse" />
                    </td>
                    <td className="p-4 text-right">
                      <div className="h-4 bg-neutral-200 rounded w-16 ml-auto animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : (
                // Show actual product rows with fade-in transition
                products.map(product => (
                  <Transition
                    key={product.product_id}
                    show={productTransitionState === 'loaded'}
                    enter="transition-opacity duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <tr 
                      onClick={() => {
                        setSelectedProduct(product);
                        setModalOpen(true);
                      }}
                      className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <td className="p-4">
                        <div className="w-10 h-14 relative">
                          <Image 
                            src={product.imageSmall} 
                            alt={product.name}
                            fill
                            className="object-contain"
                            unoptimized={product.imageSmall.includes('vinmonopolet.no')}
                          />
                        </div>
                      </td>
                      <td className="p-4 font-medium text-neutral-800">{product.name}</td>
                      <td className="p-4 text-neutral-600 hidden md:table-cell">{product.category || '—'}</td>
                      <td className="p-4 text-neutral-600 hidden md:table-cell">{product.country || '—'}</td>
                      <td className="p-4 font-bold text-wine-red">{formatPrice(product.price)}</td>
                      <td className="p-4 text-right">
                        <span className="badge badge-availability">{product.utvalg || '—'}</span>
                      </td>
                    </tr>
                  </Transition>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Image Preloader - invisible but preloads upcoming images */}
      <ImagePreloader 
        products={products}
        visibleStart={visibleRange.start}
        visibleEnd={visibleRange.end}
        prefetchCount={100}
      />
      
      {/* Infinite Scroll Loader */}
      {hasMore && (
        <div 
          ref={loaderRef} 
          className="flex justify-center py-12"
        >
          {loading && !initialLoading && <Loading>Loading more products...</Loading>}
          {!loading && <div className="h-10" />}
        </div>
      )}
      
      {/* End of results indicator */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-8 text-neutral-500">
          End of results
        </div>
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
          onClick={handleClearCache}
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