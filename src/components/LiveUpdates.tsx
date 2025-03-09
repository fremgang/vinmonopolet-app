'use client';
// src/components/LiveUpdates.tsx
import { useProductStream } from './ProductStreamProvider';
import { Badge, Card, Text } from '@geist-ui/core';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LiveUpdates() {
  const { latestProduct, recentUpdates, isConnected } = useProductStream();
  
  if (!isConnected) {
    return (
      <div className="p-3 mb-4 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <AlertCircle size={16} className="text-gray-400 mr-2" />
          <Text small className="text-gray-500">Live updates disconnected</Text>
        </div>
      </div>
    );
  }
  
  if (recentUpdates.length === 0) {
    return (
      <div className="p-3 mb-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <CheckCircle2 size={16} className="text-green-500 mr-2" />
          <Text small className="text-gray-500">Live updates connected</Text>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <div className="flex items-center mb-3">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2" />
        <Text h5 className="m-0">Live Updates</Text>
      </div>
      
      <div className="space-y-3">
        {recentUpdates.map(product => (
          <Card key={product.product_id} hoverable shadow className="p-2 transition-all hover:translate-y-[-2px]">
            <div className="flex justify-between items-start">
              <div>
                <Text h6 className="m-0 mb-1">{product.name}</Text>
                <div className="text-sm text-gray-500">
                  {product.category && <span>{product.category} • </span>}
                  <span>{product.country || 'Unknown origin'}</span>
                </div>
              </div>
              <Badge type="secondary">{product.price ? `${product.price} kr` : 'No price'}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}