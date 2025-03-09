import React from 'react';
import Image from 'next/image';
import { Card } from '@geist-ui/core';
import { Map, Droplets, ArrowRight } from 'lucide-react';
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
    utvalg,
    lukt,
    smak,
    producer
  } = product;

  // Function to format price with Norwegian format
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `${new Intl.NumberFormat('no-NO').format(price)} kr`;
  };

  // Truncate text for descriptions
  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return null;
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card
      hoverable
      className="product-card overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-cabernet-200 dark:hover:border-cabernet-700 transition-all"
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* Header with product name */}
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 font-serif leading-tight">{name}</h3>
        </div>
        
        {/* Main content area */}
        <div className="px-5 pb-5 flex">
          {/* Image Container */}
          <div className="w-1/3 relative">
            <div className="aspect-[3/4] relative bg-cream dark:bg-gray-900 rounded-md overflow-hidden border border-gray-100 dark:border-gray-700">
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
                <div className="flex items-start">
                  <div className="mt-0.5 mr-1.5">
                    <Droplets size={14} className="text-cabernet-600 dark:text-cabernet-400" />
                  </div>
                  <div>
                    <span className="font-medium text-xs uppercase tracking-wide text-cabernet-600 dark:text-cabernet-400">Aroma</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{lukt}</p>
                  </div>
                </div>
              </div>
            )}
            
            {smak && (
              <div className="mb-2 text-sm">
                <div className="flex items-start">
                  <div className="mt-0.5 mr-1.5">
                    <Droplets size={14} className="text-cabernet-600 dark:text-cabernet-400" />
                  </div>
                  <div>
                    <span className="font-medium text-xs uppercase tracking-wide text-cabernet-600 dark:text-cabernet-400">Taste</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{smak}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with details and categories */}
        <div className="mt-auto px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {/* Categories and regions */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {category && (
              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-oak-100 dark:bg-oak-900 text-oak-800 dark:text-oak-100">
                {category}
              </span>
            )}
            {country && (
              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-vineyard-100 dark:bg-vineyard-900 text-vineyard-800 dark:text-vineyard-100">
                {country}
              </span>
            )}
            {district && (
              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-cabernet-100 dark:bg-cabernet-900 text-cabernet-800 dark:text-cabernet-100">
                {district}
              </span>
            )}
          </div>
          
          {/* Price and details button */}
          <div className="flex justify-between items-center">
            <div>
              <div className="text-lg font-bold text-cabernet-800 dark:text-cabernet-300">
                {formatPrice(price)}
              </div>
              {producer && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {producer}
                </div>
              )}
            </div>
            
            <button
              className="flex items-center text-sm text-cabernet-700 dark:text-cabernet-300 hover:text-cabernet-900 dark:hover:text-cabernet-100 transition-colors"
            >
              <span className="mr-1">Details</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}