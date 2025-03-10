// src/components/product/ProductCard.tsx
import React, { useState, useEffect, forwardRef } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardTitle
} from '@/components/ui/card';
import { Globe, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  isLoading?: boolean;
}

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, onClick, isLoading = false }, ref) => {
    const [imageError, setImageError] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string>('');
    
    // Reset states if product changes
    useEffect(() => {
      setImageError(false);
      setImageUrl(product.imageMain || '');
    }, [product.product_id, product.imageMain]);
    
    const {
      name,
      category,
      country,
      price,
      lukt,
      smak,
      district,
      utvalg,
      producer
    } = product;
    
    // Get main category and region
    const mainCategory = category?.split('-')[0].trim() || '';
    const mainRegion = district?.split(',')[0].trim() || '';
    
    // Format price with Norwegian format
    const formatPrice = (price: number | null) => {
      if (price === null) return 'N/A';
      return `${new Intl.NumberFormat('no-NO').format(price)} kr`;
    };

    // Handle image load error
    const handleImageError = () => {
      setImageError(true);
    };

    return (
      <Card 
        ref={ref}
        onClick={onClick}
        className="h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 flex flex-col overflow-hidden cursor-pointer"
      >
        <CardHeader className="pb-3 border-b border-neutral-100">
          <CardTitle className="text-lg line-clamp-2 text-center font-serif">{name}</CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="mb-4 flex justify-center bg-white rounded-md p-2">
            <div className="product-image-wrapper h-[140px] w-[100px] flex items-center justify-center">
              {!imageError && imageUrl ? (
                <Image
                  src={`/api/products/image-cache?url=${encodeURIComponent(imageUrl)}`}
                  alt={name}
                  width={100}
                  height={140}
                  className="max-h-[140px] w-auto object-contain"
                  sizes="100px"
                  loading="lazy"
                  onError={handleImageError}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-neutral-400 text-sm text-center">
                  No image available
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-3 flex-grow">
            {/* Country and Region */}
            {(country || mainRegion) && (
              <div className="flex items-center text-sm text-neutral-600">
                <Globe size={14} className="mr-1.5 text-neutral-400 flex-shrink-0" />
                <span className="truncate">{[country, mainRegion].filter(Boolean).join(', ')}</span>
              </div>
            )}
            
            {/* Category */}
            {mainCategory && (
              <div className="flex items-center text-sm text-neutral-600">
                <Tag size={14} className="mr-1.5 text-neutral-400 flex-shrink-0" />
                <span className="truncate">{mainCategory}</span>
              </div>
            )}
            
            {/* Taste Description */}
            {(lukt || smak) && (
              <div className="mt-2">
                <h4 className="text-xs uppercase tracking-wide font-semibold text-wine-red mb-1">
                  {lukt && smak ? 'Aroma & Taste' : (lukt ? 'Aroma' : 'Taste')}
                </h4>
                <p className="text-sm text-neutral-700 line-clamp-3">
                  {lukt || smak}
                </p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="mt-auto bg-neutral-50 border-t p-4 flex justify-between items-center">
          <div className="text-lg font-bold text-wine-red">
            {formatPrice(price)}
          </div>
          
          <div className="text-right">
            {producer && (
              <div className="text-xs text-neutral-600 truncate max-w-[130px]">
                {producer}
              </div>
            )}
            {utvalg && (
              <div className="text-xs italic text-neutral-500">
                {utvalg}
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  }
);

ProductCard.displayName = 'ProductCard';

export default ProductCard;