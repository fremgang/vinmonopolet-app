'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Select, Button, Text, Loading } from '@geist-ui/core';
import { Search, Filter, List, Grid } from 'lucide-react';
import FilterPanel from '@/components/FilterPanel';
import ProductCard from '@/components/ProductCard';
import ProductDetailsModal from '@/components/ProductDetailsModal';

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

  // Main fetch function - DEFINE THIS FIRST
  const fetchProducts = useCallback(async (pageNum: number, reset = false) => {
    if (loading) return;
    
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    
    controllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      
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
        throw new Error(`HTTP error ${response.status}`);
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
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [debouncedSearch, sortBy, sortOrder, filters, loading]);

  // Initial and filter-change data fetch
  useEffect(() => {
    fetchProducts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, sortBy, sortOrder, filters]);

  // Load more products for infinite scroll - DEFINE THIS SECOND
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

  // Render a table row for list view
  const renderListItem = (product: Product) => {
    return (
      <div 
        key={product.product_id}
        className="list-table-row hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
        onClick={() => {
          setSelectedProduct(product);
          setModalOpen(true);
        }}
      >
        <div className="list-table-cell image-cell">
          <div className="product-image-container">
            <img 
              src={product.imageMain} 
              alt={product.name}
              onError={(e) => { e.currentTarget.src = '/wine-placeholder.svg' }}
              className="product-image"
            />
          </div>
        </div>
        <div className="list-table-cell name-cell font-medium">
          {product.name}
        </div>
        <div className="list-table-cell category-cell">
          {product.category || '—'}
        </div>
        <div className="list-table-cell country-cell">
          {product.country || '—'}
        </div>
        <div className="list-table-cell type-cell">
          {product.varetype || '—'}
        </div>
        <div className="list-table-cell price-cell font-bold text-wine-800">
          {formatPrice(product.price)}
        </div>
        <div className="list-table-cell availability-cell">
          <span className="availability-badge">
            {product.utvalg || '—'}
          </span>
        </div>
      </div>
    );
  };

  // List view table header
  const renderListHeader = () => {
    return (
      <div className="list-table-header">
        <div className="list-table-cell image-cell">Image</div>
        <div className="list-table-cell name-cell">Name</div>
        <div className="list-table-cell category-cell">Category</div>
        <div className="list-table-cell country-cell">Country</div>
        <div className="list-table-cell type-cell">Type</div>
        <div className="list-table-cell price-cell">Price</div>
        <div className="list-table-cell availability-cell">Availability</div>
      </div>
    );
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
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
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
      
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-6 shadow-md transition-all animate-fade-in">
          <FilterPanel 
            filters={filters} 
            onUpdateFilters={handleUpdateFilters} 
          />
        </div>
      )}
      
      {error && (
        <div className="p-4 mb-4 text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <Text p className="text-gray-600 dark:text-gray-300">
          {pagination?.total || 0} products found
          {products.length > 0 && pagination && products.length < pagination.total && 
            ` (showing ${products.length})`}
        </Text>
        
        {(filters.countries.length > 0 || filters.categories.length > 0 || 
          filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500">Active filters:</span>
            {filters.countries.map(country => (
              <span key={country} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs">
                {country}
              </span>
            ))}
            {filters.categories.map(category => (
              <span key={category} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs">
                {category}
              </span>
            ))}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) && (
              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs">
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
      
      {/* Product grid/list container */}
      {viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard 
              key={product.product_id} 
              product={product} 
              isGrid={true}
              onClick={() => {
                setSelectedProduct(product);
                setModalOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        // List View - Table style
        <div className="overflow-x-auto w-full">
          <div className="list-table">
            {renderListHeader()}
            <div className="list-table-body">
              {products.map(product => renderListItem(product))}
            </div>
          </div>
        </div>
      )}
      
      {/* Infinite scroll loader */}
      {hasMore && (
        <div 
          ref={loaderRef} 
          className="flex justify-center py-12"
        >
          {loading && <Loading>Loading more products...</Loading>}
          {!loading && <div className="h-10" />}
        </div>
      )}
      
      {/* No more products indicator */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          End of results
        </div>
      )}
      
      <ProductDetailsModal 
        product={selectedProduct} 
        visible={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
      
      {!loading && products.length === 0 && (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Text h4>No products found</Text>
          <Text p>Try adjusting your search criteria or filters</Text>
        </div>
      )}
    </div>
  );
}