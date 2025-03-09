// src/components/ProductCard.tsx
import React, { useState, useEffect, forwardRef } from 'react';
import Image from 'next/image';
import { Product } from '@/app/page';
import ImageCache from '@/utils/imageCache';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
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
  const [imageError, setImageError] = useState<boolean>(
    // Initialize to true if we already know it's a placeholder
    ImageCache.isPlaceholder(imageMain)
  );
  
  // Function to format price with Norwegian format
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `${new Intl.NumberFormat('no-NO').format(price)} kr`;
  };

  return (
    <div 
      className="product-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {/* Card Header with Centered Product Name */}
      <div className="product-card-header">
        <h3 className="product-card-title">{name}</h3>
      </div>
      
      {/* Card Body with Image and Information */}
      <div className="product-card-body">
        {/* Image Container with fixed dimensions */}
        <div className="product-card-image-container">
          {!imageError ? (
            <Image
              src={imageMain}
              alt={name}
              width={120}
              height={180}
              className="product-card-image"
              sizes="(max-width: 768px) 120px, 120px"
              priority={false}
              loading="lazy"
              onError={() => {
                // Mark this image as a placeholder in our global cache
                ImageCache.markAsPlaceholder(imageMain);
                setImageError(true);
              }}
              onLoad={() => {
                // Record successful load in our cache
                ImageCache.markAsLoaded(imageMain);
              }}
            />
          ) : (
            // Use static placeholder for failed images - this is a LOCAL file, not from vinmonopolet.no
            <Image
              src="/bottle-placeholder.png"
              alt="Product image placeholder"
              width={120}
              height={180}
              className="product-card-image opacity-60"
              sizes="(max-width: 768px) 120px, 120px"
            />
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