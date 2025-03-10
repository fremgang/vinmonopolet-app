// src/hooks/useProducts.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import useProductCache from './useProductCache'; // Your existing cache hook
import { Product, PaginationInfo, ProductFilters, ProductSort, LoadingState } from '@/types';

export function useProducts() {
  // Product data state
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // Filter and sort state
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    countries: [],
    categories: [],
    priceRange: [0, 100000]
  });
  
  const [sort, setSort] = useState<ProductSort>({
    field: 'price',
    order: 'desc'
  });
  
  // References for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  
  // Use product cache hook
  const { 
    fetchProducts, 
    prefetchProducts, 
    clearCache
  } = useProductCache();
  
  // Handler for filter updates
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    
    // Reset pagination when filters change
    setPage(1);
    setProducts([]);
    setLoadingState('loading');
    setHasMore(true);
  }, []);
  
  // Handler for sort updates
  const updateSort = useCallback((newSort: Partial<ProductSort>) => {
    setSort(prev => ({
      ...prev,
      ...newSort
    }));
    
    // Reset pagination when sort changes
    setPage(1);
    setProducts([]);
    setLoadingState('loading');
    setHasMore(true);
  }, []);
  
  // Parse sort string (e.g., "price:desc")
  const handleSortChange = useCallback((sortString: string) => {
    const [field, order] = sortString.split(':') as [ProductSort['field'], ProductSort['order']];
    updateSort({ field, order });
  }, [updateSort]);
  
  // Function to fetch random products
  const fetchRandomProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingState('loading');
      
      // Build query parameters for random products
      const queryParams = new URLSearchParams({
        random: 'true',
        limit: '50'
      });
      
      // Fetch random products
      const response = await fetch(`/api/products?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch random products: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update products list
      setProducts(data.products);
      setPagination(data.pagination);
      setHasMore(data.pagination.hasMore);
      
      // After a short delay, transition to the loaded state
      setTimeout(() => {
        setLoadingState('loaded');
      }, 300);
      
    } catch (err) {
      console.error('Error loading random products:', err);
      setError('Failed to load random products. Please try again.');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);
  
  // Load products with current filters and sort
  const loadProducts = useCallback(async (pageNum: number, reset = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      setLoadingState('loading');
      
      // Check if sorting by price - if so, ensure UI shows we're excluding N/A prices
      if (sort.field === 'price') {
        console.log('Filtering out products with N/A prices for price sort');
      }
      
      // Fetch products using the cache
      const result = await fetchProducts(
        pageNum,
        filters.search,
        sort.field,
        sort.order,
        {
          countries: filters.countries,
          categories: filters.categories,
          priceRange: filters.priceRange
        }
      );
      
      // Update pagination info
      setPagination(result.pagination);
      setHasMore(result.pagination.hasMore);
      
      // Update products list - either replace or append
      setProducts(prev => {
        const newProducts = reset ? result.products : [...prev, ...result.products];
        
        // After a short delay, transition to the loaded state
        setTimeout(() => {
          setLoadingState('loaded');
        }, 300);
        
        return newProducts;
      });
      
      // After we load the current page, prefetch the next page
      if (result.pagination.hasMore) {
        prefetchProducts(
          pageNum + 1,
          filters.search,
          sort.field,
          sort.order,
          {
            countries: filters.countries,
            categories: filters.categories,
            priceRange: filters.priceRange
          }
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
      setInitialDataLoaded(true);
    }
  }, [filters, sort, loading, fetchProducts, prefetchProducts]);
  
  // Load more products (for infinite scrolling)
  const loadMoreProducts = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage, false);
  }, [hasMore, loading, page, loadProducts]);
  
  // Ensure loading state is correct
  const ensureLoadedState = useCallback(() => {
    if (products.length > 0 && loadingState === 'loading') {
      console.log('Products available but in loading state, forcing transition');
      setLoadingState('loaded');
      
      if (initialLoading) {
        setInitialLoading(false);
      }
    }
  }, [products.length, loadingState, initialLoading]);
  
  // Effect to ensure loaded state periodically
  useEffect(() => {
    if (products.length > 0) {
      ensureLoadedState();
      
      // Also set a backup timer
      const timer = setTimeout(() => {
        ensureLoadedState();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [products.length, ensureLoadedState]);
  
  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!loaderRef.current || !initialDataLoaded) return;
    
    const currentLoaderRef = loaderRef.current;
    
    // Cleanup any existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    
    // Create new observer
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
  }, [hasMore, loading, loadMoreProducts, initialDataLoaded]);
  
  // Return all the state and functions
  return {
    // Data
    products,
    pagination,
    hasMore,
    
    // Loading state
    loading,
    initialLoading,
    loadingState,
    error,
    
    // Filters and sorting
    filters,
    sort,
    
    // Actions
    loadProducts,
    loadMoreProducts,
    fetchRandomProducts,
    updateFilters,
    updateSort,
    handleSortChange,
    clearCache,
    
    // Refs
    loaderRef,
    
    // Utility methods
    setInitialLoading,
    setInitialDataLoaded,
    ensureLoadedState
  };
}