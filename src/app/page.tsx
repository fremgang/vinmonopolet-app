'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Select, Button, Text, Loading } from '@geist-ui/core';
import { Search, Filter, List, Grid, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import FilterPanel from '@/components/FilterPanel';
import ProductCard from '@/components/ProductCard';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import Image from 'next/image';

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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [page, setPage] = useState(1);
  
  // Filter state
  const [filters, setFilters] = useState({
    countries: [] as string[],
    categories: [] as string[],
    priceRange: [0, 100000] as [number, number]
  });
  
  const LIMIT = 50; // Products per page
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

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
    setPage(1);
    setHasMore(true);
    setPagination(null);
  }, [debouncedSearch, sortBy, sortOrder, filters]);

  // Main fetch function
  const fetchProducts = useCallback(async (pageNum: number, reset = false) => {
    if (loading) return;
    
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    
    controllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        search: debouncedSearch,
        sortBy,
        sortOrder,
        page: pageNum.toString(),
        limit: LIMIT.toString()
      });
      
      // Add filter parameters
      if (filters.countries.length > 0) {
        filters.countries.forEach(country => {
          queryParams.append('countries', country);
        });
      }
      
      if (filters.categories.length > 0) {
        filters.categories.forEach(category => {
          queryParams.append('categories', category);
        });
      }
      
      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) {
        queryParams.append('minPrice', filters.priceRange[0].toString());
        queryParams.append('maxPrice', filters.priceRange[1].toString());
      }
      
      const url = `/api/products?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        signal: controllerRef.current.signal
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.products || !Array.isArray(data.products)) {
        throw new Error('API returned invalid data');
      }
      
      // Update pagination info
      setPagination(data.pagination);
      setHasMore(data.pagination.hasMore);
      
      // Update products list - either replace or append
      setProducts(prev => reset ? data.products : [...prev, ...data.products]);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products. Please try again.');
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [debouncedSearch, sortBy, sortOrder, filters, loading]);

  // Initial and filter-change data fetch
  useEffect(() => {
    fetchProducts(1, true);
  }, [debouncedSearch, sortBy, sortOrder, filters, fetchProducts]);

  // Load more products
  const loadMoreProducts = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  }, [hasMore, loading, page, fetchProducts]);

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
    
    return () => {
      observer.unobserve(currentLoaderRef);
    };
  }, [hasMore, loading, loadMoreProducts]);

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
    fetchProducts(1, true);
  };

  // Loading indicator
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loading>Loading products...</Loading>
      </div>
    );
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
      
      {/* Product Grid/List Display */}
      {viewMode === 'grid' ? (
        // Grid View - Improved layout with proper spacing
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div 
              key={product.product_id}
              className="h-full" // Ensure consistent height
            >
              <ProductCard 
                product={product}
                onClick={() => {
                  setSelectedProduct(product);
                  setModalOpen(true);
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        // List View - Table style with improved alignment
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
              {products.map(product => (
                <tr 
                  key={product.product_id} 
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
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Infinite Scroll Loader */}
      {hasMore && (
        <div 
          ref={loaderRef} 
          className="flex justify-center py-12"
        >
          {loading && <Loading>Loading more products...</Loading>}
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
      {!loading && products.length === 0 && !error && (
        <div className="text-center py-16 bg-neutral-50 rounded-lg border border-neutral-200">
          <Text h4 className="text-neutral-700">No products found</Text>
          <Text p className="text-neutral-600">Try adjusting your search criteria or filters</Text>
        </div>
      )}
    </div>
  );
}