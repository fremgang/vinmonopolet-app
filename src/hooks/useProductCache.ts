// src/hooks/useProductCache.ts - Fixed version for abort controller cleanup and function memoization
import { useState, useEffect, useRef, useCallback } from 'react';
import { Product, ProductResponse } from '@/types';

interface CacheState {
  products: { [key: string]: Product[] };
  metadata: { [key: string]: any };
  lastUpdated: number;
}

// Number of products to prefetch ahead of current view
const PREFETCH_COUNT = 100;
const CACHE_EXPIRY = 1000 * 60 * 15; // 15 minutes
const CACHE_STORAGE_KEY = 'vinmonopolet-product-cache-v2'; // Versioned cache key

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
      const savedCache = localStorage.getItem(CACHE_STORAGE_KEY);
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache) as CacheState;
        
        // Only use cache if it's not expired
        if (Date.now() - parsedCache.lastUpdated < CACHE_EXPIRY) {
          setCurrentCache(parsedCache);
          console.log('Loaded cache from localStorage', {
            cacheEntries: Object.keys(parsedCache.products).length,
            totalProducts: Object.values(parsedCache.products).reduce((acc, arr) => acc + arr.length, 0)
          });
        } else {
          console.log('Cache expired, creating fresh cache');
          localStorage.removeItem(CACHE_STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error('Error loading cache from localStorage:', err);
      localStorage.removeItem(CACHE_STORAGE_KEY);
    }
  }, []);

  // Save cache to localStorage when it changes
  // Using debounce to prevent excessive writes
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      try {
        // Only save if we have products
        if (Object.keys(currentCache.products).length > 0) {
          localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(currentCache));
        }
      } catch (err) {
        console.error('Error saving cache to localStorage:', err);
      }
    }, 1000); // Debounce for 1 second
    
    return () => clearTimeout(saveTimer);
  }, [currentCache]);

  // Generate normalized cache key from query parameters - memoized with useCallback
  const getCacheKey = useCallback((params: URLSearchParams) => {
    // Clone the params to avoid modifying the original
    const normalizedParams = new URLSearchParams(params.toString());
    
    // Ensure params are in consistent order
    return Array.from(normalizedParams.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  }, []);

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
      sortBy,
      sortOrder,
    });
    
    // Only add search if it's not empty
    if (searchTerm.trim()) {
      queryParams.set('search', searchTerm.trim());
    }
    
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
        Date.now() - currentCache.metadata[cacheKey].fetchedAt < CACHE_EXPIRY) {
      console.log(`Cache hit for ${cacheKey}`);
      return {
        products: currentCache.products[cacheKey],
        pagination: currentCache.metadata[cacheKey].pagination
      };
    }
    
    console.log(`Cache miss for ${cacheKey}, fetching from API`);
    
    // Mark as fetching
    fetchingRef.current.add(cacheKey);
    
    // Create abort controller for this request
    if (abortControllersRef.current[cacheKey]) {
      abortControllersRef.current[cacheKey].abort();
    }
    abortControllersRef.current[cacheKey] = new AbortController();
    const controller = abortControllersRef.current[cacheKey];
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data from API
      const response = await fetch(`/api/products?${queryParams.toString()}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache' // Prevent browser caching
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      const data = await response.json() as ProductResponse;
      
      console.log(`Fetched ${data.products.length} products out of ${data.pagination.total} total`);
      
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
  }, [currentCache, getCacheKey]);

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
      limit: '50', // Standard prefetch amount
      sortBy,
      sortOrder,
    });
    
    // Only add search if it's not empty
    if (searchTerm.trim()) {
      queryParams.set('search', searchTerm.trim());
    }
    
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
    console.log(`Prefetching page ${nextPage}`);
    
    // Create abort controller for this request
    if (abortControllersRef.current[cacheKey]) {
      abortControllersRef.current[cacheKey].abort();
    }
    abortControllersRef.current[cacheKey] = new AbortController();
    const controller = abortControllersRef.current[cacheKey];
    
    try {
      // Prefetch with lower priority
      const response = await fetch(`/api/products?${queryParams.toString()}`, {
        signal: controller.signal,
        priority: 'low' as any, // Lower priority for prefetch
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
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
  }, [currentCache, getCacheKey]);

  // Clean up function - abort any in-progress requests
  useEffect(() => {
    // Copy the current controllers to a local variable that won't change
    const controllers = { ...abortControllersRef.current };
    
    return () => {
      // Use the captured controllers in the cleanup
      Object.values(controllers).forEach(controller => {
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
      localStorage.removeItem(CACHE_STORAGE_KEY);
      console.log('Cache cleared');
    }
  };
}