'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Card, Input, Select, Button, Text, Spacer, Loading } from '@geist-ui/core';
import { Search, Grid as GridIcon, List } from 'lucide-react';

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
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('desc');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);
  const limit = 20; // Reduced from 50 to 20 for performance
  const loaderRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset offset when search or sort changes
  useEffect(() => {
    setProducts([]);
    setOffset(0);
    setHasMore(true);
  }, [debouncedSearch, sortBy, sortOrder]);

  const fetchProducts = useCallback(async (reset = false) => {
    // Don't fetch if already loading or no more results
    if (loading || (!reset && !hasMore)) return;
    
    // Cancel previous requests
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    controllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      
      // Calculate offset - if reset, start from 0
      const currentOffset = reset ? 0 : offset;
      
      const url = `/api/products?search=${encodeURIComponent(debouncedSearch)}&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=${limit}&offset=${currentOffset}`;
      console.log(`Fetching: ${url}`);
      
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
      
      setProducts(prev => (reset ? data : [...prev, ...data]));
      setOffset(prev => (reset ? limit : prev + limit));
      setHasMore(data.length === limit);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [debouncedSearch, sortBy, sortOrder, offset, hasMore, loading, limit]);

  // Initial load
  useEffect(() => {
    fetchProducts(true);
  }, [debouncedSearch, sortBy, sortOrder, fetchProducts]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!loaderRef.current || initialLoading) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchProducts();
        }
      },
      { threshold: 0.5 }
    );
    
    observer.observe(loaderRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [fetchProducts, hasMore, loading, initialLoading]);

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

  // Format price with Norwegian format
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK' }).format(price);
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
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-8">
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
            icon={viewMode === 'grid' ? <List size={18} /> : <GridIcon size={18} />}
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
      
      {error && (
        <div className="p-4 mb-4 text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      
      <Text p className="text-gray-600 mb-4">
        {products.length} products found
      </Text>
      
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'flex flex-col gap-6'
      }>
        {products.map(product => (
          <Card key={product.product_id} hoverable>
            <div className={`relative ${viewMode === 'grid' ? 'h-64' : 'h-80 md:flex gap-6'}`}>
              <div className={`${viewMode === 'grid' ? 'h-full w-full' : 'md:w-1/3 h-full flex-shrink-0'} relative`}>
                <Image
                  src={product.imageMain}
                  alt={product.name}
                  fill
                  className="object-contain p-2"
                  sizes={viewMode === 'grid' ? "33vw" : "50vw"}
                  priority={false}
                />
              </div>
              
              <div className={`${viewMode === 'grid' ? 'mt-4' : 'md:w-2/3'} flex flex-col`}>
                <Text h4 my={0}>{product.name}</Text>
                
                <div className="mt-2 text-sm space-y-1">
                  {product.category && <div><b>Category:</b> {product.category}</div>}
                  {product.country && <div><b>Country:</b> {product.country}</div>}
                  {product.district && <div><b>District:</b> {product.district}</div>}
                  {product.producer && <div><b>Producer:</b> {product.producer}</div>}
                </div>
                
                <Text h3 className="text-xl font-bold mt-3">
                  {formatPrice(product.price)}
                </Text>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {loading && !initialLoading && (
        <div className="flex justify-center my-8">
          <Loading>Loading more...</Loading>
        </div>
      )}
      
      {/* Infinite scroll trigger - intentionally small height */}
      {hasMore && <div ref={loaderRef} style={{ height: '10px' }} />}
      
      {!hasMore && products.length > 0 && (
        <Text p className="text-center text-gray-500 my-8">
          End of results
        </Text>
      )}
      
      {!loading && products.length === 0 && (
        <div className="text-center py-16">
          <Text h4>No products found</Text>
          <Text p>Try adjusting your search criteria</Text>
        </div>
      )}
    </div>
  );
}