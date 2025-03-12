// src/app/page.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from '@/components/product/ProductCard';
import ProductDetailsModal from '@/components/product/ProductDetailsModal';
import { Product } from '@/types';
import { Search, ArrowUpDown } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Ref for the loader element (for intersection observer)
  const loaderRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Initial data loading
  useEffect(() => {
    loadProducts(1, true);
  }, [searchTerm, sortBy, sortOrder]);
  
  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    // Don't set up observer if we're loading or there's no more data
    if (loading || loadingMore || !hasMore) return;
    
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new observer
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
          console.log('Loader element is visible, loading more products');
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );
    
    // Observe the loader element if it exists
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
      observerRef.current = observer;
    }
    
    // Clean up
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, loadingMore, hasMore, products.length]);
  
  // Load products function
  const loadProducts = async (pageNum: number, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        sortBy: sortBy,
        sortOrder: sortOrder
      });
      
      // Add search parameter if we have a search term
      if (searchTerm) {
        params.append('search', searchTerm);
      } else if (sortBy === 'name') {
        // Only use random if sorting by name (default)
        params.append('random', 'true');
      }
      
      // When sorting by price, ensure we only get products with prices
      if (sortBy === 'price') {
        params.append('priceNotNull', 'true');
      }
      
      console.log(`Loading products, page: ${pageNum}, search: "${searchTerm}", sort: ${sortBy} ${sortOrder}`);
      
      // Make the API request
      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Error loading products');
      }
      
      // Update products list
      if (reset) {
        setProducts(data.products);
      } else {
        // Don't add duplicates
        const productIds = new Set(products.map(p => p.product_id));
        const newProducts = data.products.filter(p => !productIds.has(p.product_id));
        setProducts(prev => [...prev, ...newProducts]);
      }
      
      // Update pagination info
      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
      
      console.log(`Loaded ${data.products.length} products, total: ${data.pagination.total}, hasMore: ${data.pagination.hasMore}`);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  // Load more products
  const loadMoreProducts = useCallback(() => {
    if (!hasMore || loading || loadingMore) return;
    
    const nextPage = page + 1;
    console.log(`Loading more products, page ${nextPage}`);
    loadProducts(nextPage, false);
  }, [page, hasMore, loading, loadingMore]);
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };
  
  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  
  // Handle sort by price toggle
  const togglePriceSort = () => {
    if (sortBy !== 'price') {
      // Switch to price sorting (descending first - most expensive)
      setSortBy('price');
      setSortOrder('desc');
    } else {
      // Toggle between ascending and descending
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-semibold mb-6">Discover Fine Wines & Spirits</h1>
      
      {/* Search and sort controls */}
      <div className="mb-8">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <form onSubmit={handleSearch} className="flex flex-grow">
            <input
              type="text"
              placeholder="Search wines, spirits..."
              value={searchInput}
              onChange={handleSearchInputChange}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-wine-red focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-wine-red text-white rounded-r-md hover:bg-wine-red-light transition-colors duration-200"
            >
              <Search size={20} />
            </button>
          </form>
          
          {/* Sort button */}
          <button
            onClick={togglePriceSort}
            className={`ml-2 px-3 py-2 rounded-md transition-colors flex items-center ${
              sortBy === 'price' 
                ? 'bg-wine-red text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={sortBy === 'price' 
              ? `Sort by price (${sortOrder === 'asc' ? 'lowest first' : 'highest first'})`
              : 'Sort by price'
            }
          >
            <ArrowUpDown size={18} className="mr-1" />
            {sortBy === 'price' && (
              <span className="text-xs font-semibold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
        </div>
        
        {/* Price sorting notice */}
        {sortBy === 'price' && (
          <div className="text-center mt-2 text-xs text-gray-500">
            Showing only products with available prices, sorted by {sortOrder === 'asc' ? 'lowest' : 'highest'} first
          </div>
        )}
      </div>
      
      {/* Loading indicator for initial load */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-red"></div>
        </div>
      )}
      
      {/* Error message */}
      {error && !loading && products.length === 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Error loading products</p>
          <p className="text-sm">{error}</p>
          <button
            className="mt-3 px-4 py-2 bg-wine-red text-white rounded-md"
            onClick={() => loadProducts(1, true)}
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Search results message */}
      {!loading && searchTerm && products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-lg font-medium">No products found for "{searchTerm}"</p>
          <p className="text-gray-600 mt-2">Try a different search term or browse our catalog</p>
          <button
            className="mt-4 px-4 py-2 bg-wine-red text-white rounded-md"
            onClick={() => setSearchTerm('')}
          >
            Clear Search
          </button>
        </div>
      )}
      
      {/* Product Grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.product_id} className="h-full">
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
      )}
      
      {/* Loading more indicator */}
      {loadingMore && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-wine-red"></div>
        </div>
      )}
      
      {/* Intersection observer target element */}
      {hasMore && !loading && !loadingMore && (
        <div 
          ref={loaderRef} 
          className="h-20 w-full mt-8"
          id="infinite-scroll-marker"
        ></div>
      )}
      
      {/* End of results message */}
      {!hasMore && products.length > 0 && (
        <div className="text-center text-gray-500 mt-8 py-4 border-t border-gray-200">
          <p>End of results</p>
        </div>
      )}
      
      {/* Product details modal */}
      <ProductDetailsModal
        product={selectedProduct}
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
