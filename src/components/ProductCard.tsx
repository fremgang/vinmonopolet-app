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

  return (
    <Card
      hoverable
      className={`product-card transition-all duration-200 hover:shadow-lg bg-white 
       ${isListView ? 'flex w-full' : ''}`}
      onClick={onClick}
    >
      {isListView ? (
        // List View Layout - horizontal card with image on left, content on right
        <div className="flex w-full p-4">
          <div className="relative w-[100px] h-[150px] flex-shrink-0 mr-4">
            <Image
              src={imageMain}
              alt={name}
              fill
              className="object-contain"
              sizes="100px"
              priority={false}
              onError={handleImageError}
            />
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-serif font-bold mb-2">{name}</h3>
            
            <div className="flex flex-col mb-3">
              {category && (
                <span className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Category:</span> {category}
                </span>
              )}
              {country && (
                <span className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Country:</span> {country}
                </span>
              )}
              {varetype && (
                <span className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Type:</span> {varetype}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {lukt && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Aroma:</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{lukt}</p>
                </div>
              )}
              {smak && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Taste:</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{smak}</p>
                </div>
              )}
            </div>
            
            <div className="mt-2 flex justify-between items-center">
              <p className="text-lg font-bold text-wine-800">{formatPrice(price)}</p>
              {utvalg && (
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  {utvalg}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Grid View Layout
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
      )}
    </Card>
  );
}