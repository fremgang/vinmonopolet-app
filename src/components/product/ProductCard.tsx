// src/components/product/ProductCard.tsx - Fixed footer position
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
import { cn } from '@/lib/utils';
import SkeletonProductCard from './SkeletonProductCard';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  isLoading?: boolean;
}

// Helper function to get cached image URL
const getCachedImageUrl = (originalUrl: string, skipCache = false) => {
  if (!originalUrl) return '';
  return `/api/products/image-cache?url=${encodeURIComponent(originalUrl)}${skipCache ? '&skipCache=true' : ''}`;
};

// Helper to extract main category, dropping subcategories
const getMainCategory = (category: string | null): string => {
  if (!category) return '';
  // Extract first part of category (before first hyphen)
  const mainCategory = category.split('-')[0].trim();
  return mainCategory;
};

// Helper to extract main region, dropping subregions
const getMainRegion = (district: string | null): string => {
  if (!district) return '';
  // Sometimes districts have commas or other separators
  return district.split(',')[0].trim();
};

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, onClick, isLoading = false }, ref) => {
    // Always declare all hooks at the top level
    const [imageError, setImageError] = useState<boolean>(false);
    const [usedDirectUrl, setUsedDirectUrl] = useState<boolean>(false);
    
    // Reset states if product changes
    useEffect(() => {
      setImageError(false);
      setUsedDirectUrl(false);
    }, [product.product_id]);
    
    // If in loading state, render skeleton
    if (isLoading) {
      return <SkeletonProductCard />;
    }
    
    const {
      name,
      category,
      country,
      price,
      imageMain,
      lukt,
      smak,
      district,
      utvalg
    } = product;
    
    // Get simplified values
    const mainCategory = getMainCategory(category);
    const mainRegion = getMainRegion(district);
    
    // Get cached image URL
    const cachedImageUrl = imageMain ? getCachedImageUrl(imageMain) : '';
    
    // Function to format price with Norwegian format
    const formatPrice = (price: number | null) => {
      if (price === null) return 'N/A';
      return `${new Intl.NumberFormat('no-NO').format(price)} kr`;
    };

    // Handle image load error
    const handleImageError = () => {
      if (!usedDirectUrl && imageMain) {
        // If cached image failed, try direct URL as fallback
        console.log(`Cached image failed, trying direct URL: ${imageMain}`);
        setUsedDirectUrl(true);
      } else {
        // If direct URL also failed, show placeholder
        console.error(`Image failed to load: ${usedDirectUrl ? imageMain : cachedImageUrl}`);
        setImageError(true);
      }
    };

    // Current image URL based on state
    const currentImageUrl = usedDirectUrl ? imageMain : cachedImageUrl;

    return (
      <Card 
        ref={ref}
        onClick={onClick}
        className="cursor-pointer h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 flex flex-col"
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-2 text-center font-serif">{name}</CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 flex-grow">
          {/* Image Container - with explicit white background and class for targeting */}
          <div className="flex items-center justify-center w-full md:w-2/5 h-[160px] bg-white rounded p-2 border border-gray-100 image-container product-image-wrapper">
            {!imageError && currentImageUrl ? (
              <Image
                src={currentImageUrl}
                alt={name}
                width={100}
                height={160}
                className="max-h-[140px] w-auto object-contain"
                sizes="(max-width: 768px) 100px, 100px"
                priority={false}
                loading="lazy"
                onError={handleImageError}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400">
                {imageError ? "No image available" : "Loading..."}
              </div>
            )}
          </div>
          
          {/* Content Container - Simplified to just focus on aroma and taste */}
          <div className="flex flex-col gap-3 w-full md:w-3/5">
            {/* Aroma Section */}
            {lukt && (
              <div className="space-y-1">
                <h4 className="text-xs uppercase font-semibold text-neutral-800">Aroma</h4>
                <p className="text-sm text-gray-700 line-clamp-3">{lukt}</p>
              </div>
            )}
            
            {/* Taste Section */}
            {smak && (
              <div className="space-y-1">
                <h4 className="text-xs uppercase font-semibold text-neutral-800">Taste</h4>
                <p className="text-sm text-gray-700 line-clamp-3">{smak}</p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50 border-t p-4 mt-auto">
          <div className="w-full flex">
            {/* Price on the left */}
            <div className="text-lg font-bold text-neutral-900 mr-auto self-center">
              {formatPrice(price)}
            </div>
            
            {/* Metadata on separate lines, aligned right */}
            <div className="text-right text-xs self-end">
              {/* Country and Region */}
              {country && (
                <div className="font-medium text-neutral-700">
                  {country} {mainRegion && `(${mainRegion})`}
                </div>
              )}
              
              {/* Main Category */}
              {mainCategory && (
                <div className="font-normal text-neutral-600">
                  {mainCategory}
                </div>
              )}
              
              {/* Utvalg */}
              {utvalg && (
                <div className="italic font-light text-neutral-500">
                  {utvalg}
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  }
);

ProductCard.displayName = 'ProductCard';

export default ProductCard;