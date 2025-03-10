// src/components/product/ProductDetailsModal.tsx
import React from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Globe, MapPin, Wine, X, Tag } from 'lucide-react';
import { getCachedImageUrl } from '@/lib/image-utils';

interface ProductModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({ product, visible, onClose }: ProductModalProps) {
  if (!product) return null;

  // Function to format price with Norwegian format
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK' }).format(price);
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[825px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif pr-8">{product.name}</DialogTitle>
          {product.category && (
            <DialogDescription>
              {product.category}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-6 py-4">
          <div className="w-full md:w-2/5">
            <div className="aspect-[3/4] relative bg-gray-50 rounded-lg overflow-hidden">
              {product.imageMain ? (
                <Image
                  src={getCachedImageUrl(product.imageMain)}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No image available
                </div>
              )}
            </div>
          </div>
          
          {/* Product Details */}
          <div className="w-full md:w-3/5">
            <div className="flex flex-wrap gap-2 mb-3">
              {product.category && (
                <Badge variant="category" className="flex items-center gap-1">
                  <Tag size={12} />
                  <span className="truncate max-w-[120px]">{product.category}</span>
                </Badge>
              )}
              {product.country && (
                <Badge variant="country" className="flex items-center gap-1">
                  <Globe size={12} />
                  <span>{product.country}</span>
                </Badge>
              )}
              {product.utvalg && (
                <Badge variant="outline">{product.utvalg}</Badge>
              )}
            </div>
            
            <div className="text-2xl font-bold text-[var(--wine-red)] mb-4">
              {formatPrice(product.price)}
            </div>
            
            {/* Main details */}
            <div className="space-y-4 mb-4">
              {(product.district || product.sub_district) && (
                <div className="flex items-start">
                  <MapPin size={18} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Region</span>
                    <div className="text-gray-600">
                      {product.district}
                      {product.sub_district && `, ${product.sub_district}`}
                    </div>
                  </div>
                </div>
              )}
              
              {product.producer && (
                <div className="flex items-start">
                  <Wine size={18} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Producer</span>
                    <div className="text-gray-600">{product.producer}</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Taste profile */}
            {(product.lukt || product.smak) && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Taste Profile</h3>
                {product.lukt && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Aroma:</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.lukt}</p>
                  </div>
                )}
                {product.smak && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Taste:</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.smak}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="wine" 
            className="flex items-center gap-2"
            asChild
          >
            <a 
              href={`https://www.vinmonopolet.no/search?q=${encodeURIComponent(product.name)}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ShoppingBag size={16} />
              View on Vinmonopolet
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}