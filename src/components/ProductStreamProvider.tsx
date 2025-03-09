'use client';
// src/components/ProductStreamProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '@/app/page';

// Define context types
type ProductStreamContextType = {
  latestProduct: Product | null;
  recentUpdates: Product[];
  isConnected: boolean;
};

// Create context with default values
const ProductStreamContext = createContext<ProductStreamContextType>({
  latestProduct: null,
  recentUpdates: [],
  isConnected: false,
});

// Hook for using the context
export const useProductStream = () => useContext(ProductStreamContext);

// Provider component props
type ProductStreamProviderProps = {
  children: React.ReactNode;
  category?: string;
  country?: string;
};

export function ProductStreamProvider({ 
  children, 
  category, 
  country 
}: ProductStreamProviderProps) {
  const [latestProduct, setLatestProduct] = useState<Product | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<Product[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Create query parameters
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (country) params.append('country', country);
    
    // Connect to the stream
    const eventSource = new EventSource(`/api/streams/products?${params.toString()}`);
    
    // Handle connection open
    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('Stream connection established');
    };
    
    // Handle incoming messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle product update events
        if (data.type === 'update' && data.entity === 'products') {
          const product = data.data;
          
          // Update latest product
          setLatestProduct(product);
          
          // Add to recent updates (keeping last 5)
          setRecentUpdates(prev => {
            const filtered = prev.filter(p => p.product_id !== product.product_id);
            return [product, ...filtered].slice(0, 5);
          });
        }
      } catch (error) {
        console.error('Error parsing stream data:', error);
      }
    };
    
    // Handle errors
    eventSource.onerror = (error) => {
      console.error('Stream error:', error);
      setIsConnected(false);
      
      // Try to reconnect after a delay
      setTimeout(() => {
        eventSource.close();
        // Reconnection will happen automatically in most browsers
      }, 5000);
    };
    
    // Clean up on unmount
    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [category, country]);
  
  // Context value
  const value = {
    latestProduct,
    recentUpdates,
    isConnected
  };
  
  return (
    <ProductStreamContext.Provider value={value}>
      {children}
    </ProductStreamContext.Provider>
  );
}