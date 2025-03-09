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
    price,
    imageMain,
    utvalg
  } = product;

  // Function to format price with Norwegian format
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `${new Intl.NumberFormat('no-NO').format(price)} kr`;
  };

  // Grid View Layout with improved styling
  return (
    <Card
      hoverable
      className="product-card hover:shadow-card-hover bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden"
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="aspect-[4/3] relative bg-gray-50 dark:bg-gray-900 rounded-t-lg overflow-hidden">
          <Image
            src={imageMain}
            alt={name}
            fill
            className="object-contain p-2 transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            unoptimized={imageMain.includes('vinmonopolet.no')}
            onError={(e) => {
              // Fallback for broken images
              const target = e.target as HTMLImageElement;
              target.src = '/file.svg';
              target.classList.add('p-8', 'opacity-50');
            }}
          />
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-medium mb-1 line-clamp-2 text-gray-900 dark:text-gray-100">{name}</h3>
          
          {/* Category and country badges */}
          <div className="flex flex-wrap gap-1 mt-1 mb-2">
            {category && (
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {category}
              </span>
            )}
            {country && (
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-wine-100 dark:bg-wine-900 text-wine-800 dark:text-wine-200">
                {country}
              </span>
            )}
          </div>
          
          <div className="mt-auto flex justify-between items-end pt-2">
            {utvalg && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {utvalg}
              </span>
            )}
            <div className="text-lg font-bold text-wine-800 dark:text-wine-400 ml-auto">
              {formatPrice(price)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}