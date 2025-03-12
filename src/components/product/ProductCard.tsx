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
import { Globe, Tag, Wine } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  loading?: boolean;
  isPriority?: boolean;
  imageSize?: 'tiny' | 'small' | 'medium' | 'large';
  useWebP?: boolean;
}

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ 
    product, 
    onClick, 
    loading = false, 
    isPriority = false, 
    imageSize = 'small',
    useWebP = true
  }, ref) => {
    const [imageError, setImageError] = useState<boolean>(false);
    
    // Use direct image URL instead of going through the cache API
    const getImageUrl = (product: Product): string => {
      if (!product?.imageMain) {
        return '/placeholder-wine.png'; // You should add a placeholder image to your public folder
      }
      
      // Just use the direct URL
      return product.imageMain;
    };

    const {
      product_id,
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

    // Format product ID to be more visible
    const formatProductId = (id: string) => {
      if (!id) return '';
      // Only show numeric part of ID
      return id.replace(/^(\d+).*$/, '$1'); 
    };

    // Format aroma & taste content from lukt and smak
    const formatTasteProfile = () => {
      let description = '';
      
      if (lukt) {
        description = lukt;
      } else if (smak) {
        description = smak;
      }
      
      if (description.length > 120) {
        return description.substring(0, 120) + '...';
      }
      
      return description;
    };

    return (
      <Card 
        ref={ref}
        id={`product-card-${product_id}`}
        onClick={onClick}
        className="h-full w-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer flex flex-col overflow-hidden mx-auto bg-white rounded-md"
      >
        <CardHeader className="pb-2 px-4 pt-4 border-b border-neutral-100">
          <CardTitle className="text-base line-clamp-2 text-center font-medium">
            {name}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="flex flex-col h-full">
            {/* Center product image - INCREASED SIZE */}
            <div className="flex justify-center mb-3">
              <div className="product-image-wrapper h-[180px] w-[130px] flex items-center justify-center bg-white p-1">
                {!imageError ? (
                  <Image
                    src={getImageUrl(product)}
                    alt={name}
                    width={130}
                    height={180}
                    className="max-h-[180px] w-auto object-contain"
                    sizes={`130px`}
                    {...(isPriority ? { priority: true } : { loading: 'lazy' })}
                    onError={handleImageError}
                    style={{ width: 'auto', height: '100%', maxWidth: '130px' }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-neutral-400 text-xs text-center">
                    No image
                  </div>
                )}
              </div>
            </div>
            
            {/* Taste section with title */}
            <div className="flex-grow">
              <h4 className="text-xs uppercase font-semibold text-wine-red mb-1.5">
                AROMA & TASTE
              </h4>
              
              <p className="text-xs text-neutral-700 line-clamp-4">
                {formatTasteProfile()}
              </p>
              
              {/* Location info with icons */}
              <div className="mt-3 space-y-1.5">
                {mainRegion && (
                  <div className="flex items-center text-xs text-neutral-600">
                    <Globe size={12} className="mr-1.5 text-neutral-400 flex-shrink-0" />
                    <span>{mainRegion}</span>
                  </div>
                )}
                
                {producer && (
                  <div className="flex items-center text-xs text-neutral-600">
                    <Wine size={12} className="mr-1.5 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">{producer}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="mt-auto bg-neutral-50 border-t p-3 flex justify-between items-center">
          <div className="text-base font-bold text-wine-red">
            {formatPrice(price)}
          </div>
          
          <div className="text-right">
            <div className="text-xs text-neutral-400">
              {formatProductId(product_id)}
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  }
);

ProductCard.displayName = 'ProductCard';

export default ProductCard;
