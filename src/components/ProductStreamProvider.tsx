// Modified src/components/ProductStreamProvider.tsx

'use client';
import React, { createContext, useContext, useState } from 'react';
import { Product } from '@/types';

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
  // Just use static state instead of EventSource
  const [latestProduct, setLatestProduct] = useState<Product | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<Product[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // No live connection - just return a simple provider with default values
  const value = {
    latestProduct,
    recentUpdates,
    isConnected: false // Always false since we're not connecting
  };
  
  return (
    <ProductStreamContext.Provider value={value}>
      {children}
    </ProductStreamContext.Provider>
  );
}