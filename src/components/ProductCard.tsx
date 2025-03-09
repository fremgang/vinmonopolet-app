import React from 'react';
import Image from 'next/image';
import { Card } from '@geist-ui/core';
import { Product } from '@/app/page';

interface ProductCardProps {
  product: Product;
  isGrid: boolean;
  onClick?: () => void;
}

export default function ProductCard({ product, isGrid = true, onClick }: ProductCardProps) {
  const {
    name,
    category,
    country,
    district,
    price,
    imageMain,
    lukt,
    smak,
    producer
  } = product;

  // Function to format price with Norwegian format
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `${new Intl.NumberFormat('no-NO').format(price)} kr`;
  };

  return (
    <Card
      hoverable
      className="product-card overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cabernet-200 dark:hover:border-cabernet-700 transition-all"
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* Header with product name */}
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 font-serif leading-tight">{name}</h3>
        </div>
        
        {/* Main content area */}
        <div className="px-5 pb-5 flex">
          {/* Image Container - White background */}
          <div className="w-1/3 relative">
            <div className="aspect-[3/4] relative bg-white dark:bg-white rounded-md overflow-hidden border border-gray-100 dark:border-gray-100">
              <Image
                src={imageMain}
                alt={name}
                fill
                className="object-contain p-1 transition-opacity duration-300"
                sizes="(max-width: 768px) 33vw, 150px"
                loading="lazy"
                unoptimized={imageMain.includes('vinmonopolet.no')}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/file.svg';
                  target.classList.add('p-5', 'opacity-50');
                }}
              />
            </div>
          </div>

          {/* Taste & Aroma section */}
          <div className="w-2/3 pl-4 flex flex-col">
            {lukt && (
              <div className="mb-2 text-sm">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-cabernet-600 dark:text-cabernet-400">Aroma</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{lukt}</p>
                </div>
              </div>
            )}
            
            {smak && (
              <div className="mt-2 text-sm">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-cabernet-600 dark:text-cabernet-400">Taste</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{smak}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with minimalistic info display */}
        <div className="mt-auto px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {/* Top row with classification and country */}
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>{category || ''}</span>
            <span>{country || ''}</span>
          </div>
          
          {/* Second row with region/district */}
          {district && (
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>{district}</span>
            </div>
          )}
          
          {/* Bottom row with price and producer */}
          <div className="flex justify-between items-center mt-1">
            <div className="text-lg font-bold text-cabernet-800 dark:text-cabernet-300">
              {formatPrice(price)}
            </div>
            {producer && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {producer}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}