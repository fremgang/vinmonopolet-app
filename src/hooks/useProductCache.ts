// src/hooks/useProductCache.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Product } from '@/app/page';

interface CacheState {
  products: { [key: string]: Product[] };
  metadata: { [key: string]: any };
  lastUpdated: number;
}

interface ProductResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasMore: boolean;
  };
}

// Number of products to prefetch ahead of current view
const PREFETCH_COUNT = 100;
const CACHE_EXPIRY = 1000 * 60 * 5; // 5 minutes

export default function useProductCache() {
  // In-memory cache state
  const [currentCache, setCurrentCache] = useState<CacheState>({
    products: {},
    metadata: {},
    lastUpdated: Date.now(),
  });
  
  // Track fetch states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(new Set<string>());
  const abortControllersRef = useRef<{ [key: string]: AbortController }>({});

  // Initialize with cached data from localStorage if available
  useEffect(() => {
    try {
      const savedCache = localStorage.getItem('productCache');
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache) as CacheState;
        
        // Only use cache if it's not expired
        if (Date.now() - parsedCache.lastUpdated < CACHE_EXPIRY) {
          setCurrentCache(parsedCache);
          console.log('Loaded cache from localStorage');
        } else {
          console.log('Cache expired, creating fresh cache');
        }
      }
    } catch (err) {
      console.error('Error loading cache from localStorage:', err);
    }
  }, []);

  // Save cache to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('productCache', JSON.stringify(currentCache));
    } catch (err) {
      console.error('Error saving cache to localStorage:', err);
    }
  }, [currentCache]);

  // Generate cache key from query parameters
  const getCacheKey = (params: URLSearchParams) => {
    return params.toString();
  };

  // Fetch products with caching
  const fetchProducts = useCallback(async (
    page: number,
    searchTerm: string = '',
    sortBy: string = 'price',
    sortOrder: string = 'desc',
    filters: any = {}
  ): Promise<ProductResponse> => {
    // Create query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: '50', // Standard limit per page
      search: searchTerm,
      sortBy,
      sortOrder,
    });
    
    // Add filter parameters
    if (filters.countries?.length > 0) {
      filters.countries.forEach((country: string) => {
        queryParams.append('countries', country);
      });
    }
    
    if (filters.categories?.length > 0) {
      filters.categories.forEach((category: string) => {
        queryParams.append('categories', category);
      });
    }
    
    if (filters.priceRange?.[0] > 0 || filters.priceRange?.[1] < 100000) {
      queryParams.append('minPrice', filters.priceRange[0].toString());
      queryParams.append('maxPrice', filters.priceRange[1].toString());
    }
    
    // Generate cache key
    const cacheKey = getCacheKey(queryParams);
    
    // Check if already fetching this request
    if (fetchingRef.current.has(cacheKey)) {
      // Return a promise that will resolve when the in-progress request completes
      return new Promise((resolve) => {
        const checkCache = () => {
          if (!fetchingRef.current.has(cacheKey) && currentCache.products[cacheKey]) {
            resolve({
              products: currentCache.products[cacheKey],
              pagination: currentCache.metadata[cacheKey]?.pagination || {
                hasMore: false,
                page,
                limit: 50,
                total: currentCache.products[cacheKey]?.length || 0,
                pages: Math.ceil((currentCache.products[cacheKey]?.length || 0) / 50)
              }
            });
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }
    
    // Check if we have cached data for this query
    if (currentCache.products[cacheKey] && 
        currentCache.metadata[cacheKey] && 
        Date.now() - currentCache.lastUpdated < CACHE_EXPIRY) {
      return {
        products: currentCache.products[cacheKey],
        pagination: currentCache.metadata[cacheKey].pagination
      };
    }
    
    // Mark as fetching
    fetchingRef.current.add(cacheKey);
    
    // Create abort controller for this request
    if (abortControllersRef.current[cacheKey]) {
      abortControllersRef.current[cacheKey].abort();
    }
    abortControllersRef.current[cacheKey] = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data from API
      const response = await fetch(`/api/products?${queryParams.toString()}`, {
        signal: abortControllersRef.current[cacheKey].signal
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      const data = await response.json() as ProductResponse;
      
      // Update cache with fetched data
      setCurrentCache(prev => ({
        ...prev,
        products: {
          ...prev.products,
          [cacheKey]: data.products
        },
        metadata: {
          ...prev.metadata,
          [cacheKey]: {
            pagination: data.pagination,
            fetchedAt: Date.now()
          }
        },
        lastUpdated: Date.now()
      }));
      
      return data;
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
        throw err;
      }
      return {
        products: [],
        pagination: {
          total: 0,
          page,
          limit: 50,
          pages: 0,
          hasMore: false
        }
      };
    } finally {
      setLoading(false);
      fetchingRef.current.delete(cacheKey);
    }
  }, [currentCache]);

  // Prefetch next batch of products
  const prefetchProducts = useCallback(async (
    currentPage: number,
    searchTerm: string = '',
    sortBy: string = 'price',
    sortOrder: string = 'desc',
    filters: any = {}
  ) => {
    const nextPage = currentPage + 1;
    
    // Create query for the prefetch
    const queryParams = new URLSearchParams({
      page: nextPage.toString(),
      limit: PREFETCH_COUNT.toString(), // Prefetch more products at once
      search: searchTerm,
      sortBy,
      sortOrder,
    });
    
    // Add filter parameters
    if (filters.countries?.length > 0) {
      filters.countries.forEach((country: string) => {
        queryParams.append('countries', country);
      });
    }
    
    if (filters.categories?.length > 0) {
      filters.categories.forEach((category: string) => {
        queryParams.append('categories', category);
      });
    }
    
    if (filters.priceRange?.[0] > 0 || filters.priceRange?.[1] < 100000) {
      queryParams.append('minPrice', filters.priceRange[0].toString());
      queryParams.append('maxPrice', filters.priceRange[1].toString());
    }
    
    // Generate cache key for prefetch
    const cacheKey = getCacheKey(queryParams);
    
    // Check if already fetching or if we already have this data cached
    if (fetchingRef.current.has(cacheKey) || 
        (currentCache.products[cacheKey] && 
         Date.now() - (currentCache.metadata[cacheKey]?.fetchedAt || 0) < CACHE_EXPIRY)) {
      return;
    }
    
    // Mark as fetching
    fetchingRef.current.add(cacheKey);
    
    try {
      // Create abort controller for this request
      if (abortControllersRef.current[cacheKey]) {
        abortControllersRef.current[cacheKey].abort();
      }
      abortControllersRef.current[cacheKey] = new AbortController();
      
      // Prefetch with lower priority
      const response = await fetch(`/api/products?${queryParams.toString()}`, {
        signal: abortControllersRef.current[cacheKey].signal,
        priority: 'low' as any // Lower priority for prefetch
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json() as ProductResponse;
      
      // Update cache with prefetched data
      setCurrentCache(prev => ({
        ...prev,
        products: {
          ...prev.products,
          [cacheKey]: data.products
        },
        metadata: {
          ...prev.metadata,
          [cacheKey]: {
            pagination: data.pagination,
            fetchedAt: Date.now()
          }
        },
        lastUpdated: Date.now()
      }));
      
      console.log(`Prefetched ${data.products.length} products for page ${nextPage}`);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error prefetching products:', err);
      }
    } finally {
      fetchingRef.current.delete(cacheKey);
    }
  }, [currentCache]);

  // Clean up function - abort any in-progress requests
  useEffect(() => {
    return () => {
      Object.values(abortControllersRef.current).forEach(controller => {
        controller.abort();
      });
    };
  }, []);

  return {
    fetchProducts,
    prefetchProducts,
    loading,
    error,
    clearCache: () => {
      setCurrentCache({
        products: {},
        metadata: {},
        lastUpdated: Date.now()
      });
      localStorage.removeItem('productCache');
    }
  };
}