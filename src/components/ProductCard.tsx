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
    producer,
    sub_district
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
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 font-serif leading-tight">{name}</h3>
        </div>
        
        {/* Main content area */}
        <div className="px-6 pb-6 flex">
          {/* Image Container - Clean white background without borders */}
          <div className="w-1/3 relative">
            <div className="aspect-[3/4] relative bg-white dark:bg-white overflow-hidden">
              <Image
                src={imageMain}
                alt={name}
                fill
                className="object-contain transition-opacity duration-300"
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
          <div className="w-2/3 pl-6 flex flex-col">
            {lukt && (
              <div className="mb-3">
                <div>
                  <span className="text-sm font-medium uppercase tracking-wide text-cabernet-700 dark:text-cabernet-400">AROMA</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">{lukt}</p>
                </div>
              </div>
            )}
            
            {smak && (
              <div className="mt-4">
                <div>
                  <span className="text-sm font-medium uppercase tracking-wide text-cabernet-700 dark:text-cabernet-400">SMAK</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">{smak}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with clean, minimal styling */}
        <div className="mt-auto px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {/* Category and country */}
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
            <div>
              {category && <span>{category}</span>}
            </div>
            <div>
              {country && <span>{country}</span>}
            </div>
          </div>
          
          {/* Region/district */}
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {district && <span>{district}</span>}
          </div>
          
          {/* Price and producer */}
          <div className="flex justify-between items-center mt-2">
            <div className="text-xl font-bold text-cabernet-800 dark:text-cabernet-300">
              {formatPrice(price)}
            </div>
            {producer && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {producer}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}