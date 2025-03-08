import React from 'react';
import Image from 'next/image';
import { Card, Badge } from '@geist-ui/core';
import { Product } from '@/app/page';

interface ProductCardProps {
  product: Product;
  isGrid: boolean;
  onClick?: () => void;
}

export default function ProductCard({ product, isGrid, onClick }: ProductCardProps) {
  const {
    product_id,
    name,
    category,
    country,
    price,
    varetype,
    lukt,
    smak,
    utvalg,
    imageMain
  } = product;

  // Function to format price with Norwegian format
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `${new Intl.NumberFormat('no-NO').format(price)} kr`;
  };

  // Function to handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/wine-placeholder.svg';
  };

  return (
    <Card 
      hoverable 
      className="product-card transition-all duration-200 hover:shadow-lg bg-white"
      onClick={onClick}
    >
      <div className="flex flex-col h-full" style={{ aspectRatio: '9/16' }}>
        {/* Top 2/3 with image and essential info */}
        <div className="flex h-2/3">
          {/* Product Image - Left side */}
          <div className="w-1/2 flex items-center justify-center bg-white">
            <div className="relative w-full h-full">
              <Image
                src={imageMain}
                alt={name}
                fill
                className="object-contain transition-opacity"
                sizes="33vw"
                priority={false}
                onError={handleImageError}
              />
            </div>
          </div>
          
          {/* Essential Product Info - Right side */}
          <div className="w-1/2 p-3 flex flex-col">
            <h3 className="text-lg font-serif font-semibold mb-3 line-clamp-2">{name}</h3>
            
            {lukt && (
              <div className="mb-2">
                <p className="text-sm font-semibold text-gray-700 mb-0.5">Aroma:</p>
                <p className="text-xs text-gray-600 line-clamp-3">{lukt}</p>
              </div>
            )}
            
            {smak && (
              <div className="mb-2">
                <p className="text-sm font-semibold text-gray-700 mb-0.5">Taste:</p>
                <p className="text-xs text-gray-600 line-clamp-3">{smak}</p>
              </div>
            )}

            <div className="mt-auto">
              <p className="text-lg font-bold text-wine-800">{formatPrice(price)}</p>
            </div>
          </div>
        </div>
        
        {/* Bottom 1/3 with additional info */}
        <div className="h-1/3 p-3 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-1 mb-2">
            {varetype && (
              <Badge type="default" scale={0.5} className="bg-gray-100 text-gray-800">{varetype}</Badge>
            )}
            
            {country && (
              <Badge type="success" scale={0.5} className="bg-blue-50 text-blue-800">{country}</Badge>
            )}
            
            {utvalg && (
              <Badge type="warning" scale={0.5} className="bg-amber-50 text-amber-800">{utvalg}</Badge>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-1">Product ID: {product_id}</p>
        </div>
      </div>
    </Card>
  );
}