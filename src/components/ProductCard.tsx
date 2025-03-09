import React from 'react';
import Image from 'next/image';
import { Card, Badge } from '@geist-ui/core';
import { Product } from '@/app/page';

interface ProductCardProps {
  product: Product;
  isGrid: boolean;
  onClick?: () => void;
}

export default function ProductCard({ product, isGrid = true, onClick }: ProductCardProps) {
  // List view mode is when isGrid is false
  const isListView = !isGrid;
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

  if (isListView) {
    // Table-like List View
    return (
      <div 
        className="list-table cursor-pointer hover:shadow rounded-sm transition-all" 
        onClick={onClick}
      >
        {/* Product image - 1 column */}
        <div className="col-span-1">
          <div className="relative w-10 h-14">
            <Image
              src={imageMain}
              alt={name}
              fill
              className="object-contain"
              sizes="40px"
              priority={false}
              onError={handleImageError}
            />
          </div>
        </div>
        
        {/* Product name - 3 columns */}
        <div className="col-span-3 font-medium truncate">
          {name}
        </div>
        
        {/* Category - 2 columns */}
        <div className="col-span-2 text-sm text-gray-600 truncate">
          {category || 'Uncategorized'}
        </div>
        
        {/* Country - 1 column */}
        <div className="col-span-1 text-sm text-gray-600 truncate">
          {country || '-'}
        </div>
        
        {/* Type - 2 columns */}
        <div className="col-span-2 text-sm text-gray-500 truncate">
          {varetype || '-'}
        </div>
        
        {/* Price - 1 column */}
        <div className="col-span-1 font-bold text-wine-800">
          {formatPrice(price)}
        </div>
        
        {/* Availability - 2 columns */}
        <div className="col-span-2 text-right">
          {utvalg && (
            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
              {utvalg}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Grid View Layout (unchanged)
  return (
    <Card
      hoverable
      className="product-card transition-all duration-200 hover:shadow-lg bg-white"
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="flex h-2/3 items-center justify-center"> 
          <div className="w-1/2 flex items-center justify-center bg-white relative">
            <div className="relative w-[150px] h-[200px]">
              <Image
                src={imageMain}
                alt={name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100px, 150px"
                priority={false}
                onError={handleImageError}
              />
            </div>
          </div>
          <div className="w-1/2 p-3 flex flex-col justify-center"> 
            <h3 className="text-xl font-serif font-bold mb-3 line-clamp-2">{name}</h3>
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
      </div>
    </Card>
  );
}