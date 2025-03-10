// src/components/product/ProductCard.tsx
import React, { useState, useEffect, forwardRef } from 'react';
import Image from 'next/image';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

// Helper function to get cached image URL
const getCachedImageUrl = (originalUrl: string, skipCache = false) => {
  if (!originalUrl) return '';
  return `/api/products/image-cache?url=${encodeURIComponent(originalUrl)}${skipCache ? '&skipCache=true' : ''}`;
};

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, onClick }, ref) => {
    const {
      name,
      category,
      country,
      price,
      imageMain,
      lukt,
      smak,
      producer,
      district
    } = product;
    
    // Local state to track if image failed to load
    const [imageError, setImageError] = useState<boolean>(false);
    const [usedDirectUrl, setUsedDirectUrl] = useState<boolean>(false);
    
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

    // Reset states if product changes
    useEffect(() => {
      setImageError(false);
      setUsedDirectUrl(false);
    }, [imageMain]);

    // Current image URL based on state
    const currentImageUrl = usedDirectUrl ? imageMain : cachedImageUrl;

    return (
      <div 
        className="product-card"
        onClick={onClick}
        role="button"
        tabIndex={0}
        ref={ref}
      >
        {/* Card Header with Centered Product Name */}
        <div className="product-card-header">
          <h3 className="product-card-title">{name}</h3>
        </div>
        
        {/* Card Body with Image and Information */}
        <div className="product-card-body">
          {/* Image Container with fixed dimensions */}
          <div className="product-card-image-container">
            {!imageError && currentImageUrl ? (
              <Image
                src={currentImageUrl}
                alt={name}
                width={120}
                height={180}
                className="product-card-image"
                sizes="(max-width: 768px) 120px, 120px"
                priority={false}
                loading="lazy"
                onError={handleImageError}
              />
            ) : (
              // Use static placeholder for failed images
              <div className="flex items-center justify-center w-full h-full bg-gray-100">
                <div className="text-gray-400 text-sm text-center p-2">
                  {imageError ? "No image available" : "Loading..."}
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="product-card-content">
            {/* Aroma Section */}
            {lukt && (
              <div className="product-card-section">
                <div className="product-card-section-title">AROMA</div>
                <p className="product-card-section-content">{lukt}</p>
              </div>
            )}
            
            {/* Taste Section */}
            {smak && (
              <div className="product-card-section">
                <div className="product-card-section-title">SMAK</div>
                <p className="product-card-section-content">{smak}</p>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer with Details */}
        <div className="product-card-footer">
          <div className="product-card-details">
            {/* Category and Country */}
            <div className="product-card-info-line">
              <span className="product-card-category">{category || '—'}</span>
              <span className="product-card-country">{country || '—'}</span>
            </div>
            
            {/* District/Region if available */}
            {district && (
              <div className="product-card-info-line">
                <span className="product-card-district">{district}</span>
              </div>
            )}
            
            {/* Price and Producer on the same line with proper truncation */}
            <div className="product-card-info-line">
              <span className="product-card-price">{formatPrice(price)}</span>
              {producer && <span className="product-card-producer">{producer}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// Add display name for debugging
ProductCard.displayName = 'ProductCard';

export default ProductCard;