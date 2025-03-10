// Modified src/components/LiveUpdates.tsx
'use client';

import { useProductStream } from './ProductStreamProvider';
import { AlertCircle } from 'lucide-react';

export default function LiveUpdates() {
  const { isConnected } = useProductStream();
  
  // Always show disconnected state since streaming is disabled
  return (
    <div className="p-3 mb-4 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <AlertCircle size={16} className="text-gray-400 mr-2" />
        <p className="text-sm text-gray-500">Live updates unavailable</p>
      </div>
    </div>
  );
}