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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // For pagination
  
  // Filter state
  const [filters, setFilters] = useState({
    countries: [] as string[],
    categories: [] as string[],
    priceRange: [0, 100000] as [number, number]
  });
  
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
    setCurrentPage(1);
    setInitialLoading(true);
  }, [debouncedSearch, sortBy, sortOrder, filters]);

  // This effect runs only once on component mount
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This effect runs when dependencies that should trigger a refetch change
  useEffect(() => {
    // Skip the initial render
    if (initialLoading) return;
    
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, sortBy, sortOrder, filters]);

  // Update displayed products when current page changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedProducts(products.slice(startIndex, endIndex));
  }, [currentPage, products]);

  const fetchProducts = useCallback(async () => {
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
        sortOrder
      });
      
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
      
      if (!Array.isArray(data)) {
        throw new Error('API returned invalid data');
      }
      
      setProducts(data);
      // Initialize displayed products with the first page
      setDisplayedProducts(data.slice(0, itemsPerPage));
      setCurrentPage(1);
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
  }, [debouncedSearch, sortBy, sortOrder, loading, filters]);

  // Clean up abort controllers on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  const handleSortChange = (value: string | string[]) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    const [newSortBy, newSortOrder] = selectedValue.split(':');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };
  
  const handleUpdateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setShowFilters(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // List view header for table-like display
  const renderListHeader = () => {
    return (
      <div className="list-table-header mb-2">
        <div className="col-span-1">
          Image
        </div>
        <div className="col-span-3">
          Name
        </div>
        <div className="col-span-2">
          Category
        </div>
        <div className="col-span-1">
          Country
        </div>
        <div className="col-span-2">
          Type
        </div>
        <div className="col-span-1">
          Price
        </div>
        <div className="col-span-2 text-right">
          Availability
        </div>
      </div>
    );
  };

  // Generate pagination controls
  const renderPagination = () => {
    const totalPages = Math.ceil(products.length / itemsPerPage);
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center mt-8 mb-4">
        <div className="flex space-x-2">
          <Button 
            auto 
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            placeholder={undefined}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-2 px-2">
            {currentPage > 1 && (
              <Button 
                auto 
                type="abort" 
                scale={2/3}
                onClick={() => handlePageChange(1)}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                placeholder={undefined}
              >
                1
              </Button>
            )}
            
            {currentPage > 3 && <span>...</span>}
            
            {currentPage > 2 && (
              <Button 
                auto 
                type="abort" 
                scale={2/3}
                onClick={() => handlePageChange(currentPage - 1)}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                placeholder={undefined}
              >
                {currentPage - 1}
              </Button>
            )}
            
            <Button 
              auto 
              type="success" 
              scale={2/3}
              onClick={() => handlePageChange(currentPage)}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              placeholder={undefined}
            >
              {currentPage}
            </Button>
            
            {currentPage < totalPages - 1 && (
              <Button 
                auto 
                type="abort" 
                scale={2/3}
                onClick={() => handlePageChange(currentPage + 1)}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                placeholder={undefined}
              >
                {currentPage + 1}
              </Button>
            )}
            
            {currentPage < totalPages - 2 && <span>...</span>}
            
            {currentPage < totalPages && (
              <Button 
                auto 
                type="abort" 
                scale={2/3}
                onClick={() => handlePageChange(totalPages)}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                placeholder={undefined}
              >
                {totalPages}
              </Button>
            )}
          </div>
          
          <Button 
            auto 
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            placeholder={undefined}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

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
          {products.length} products found
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
          {displayedProducts.map(product => (
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
        // List View
        <>
          {renderListHeader()}
          <div className="flex flex-col w-full">
            {displayedProducts.map(product => (
              <ProductCard 
                key={product.product_id} 
                product={product} 
                isGrid={false}
                onClick={() => {
                  setSelectedProduct(product);
                  setModalOpen(true);
                }}
              />
            ))}
          </div>
        </>
      )}
      
      {/* Pagination controls */}
      {renderPagination()}
      
      <ProductDetailsModal 
        product={selectedProduct} 
        visible={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
      
      {loading && !initialLoading && (
        <div className="flex justify-center my-8">
          <Loading>Loading products...</Loading>
        </div>
      )}
      
      {!loading && products.length === 0 && (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Text h4>No products found</Text>
          <Text p>Try adjusting your search criteria or filters</Text>
        </div>
      )}
    </div>
  );
}