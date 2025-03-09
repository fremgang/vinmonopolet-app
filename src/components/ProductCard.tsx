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
    imageMain
  } = product;

  // Function to format price with Norwegian format
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `${new Intl.NumberFormat('no-NO').format(price)} kr`;
  };

  // Grid View Layout with 4:3 aspect ratio
  return (
    <Card
      hoverable
      className="product-card transition-all duration-200 hover:shadow-lg bg-white"
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="aspect-[4/3] relative bg-gray-50 rounded-t-lg overflow-hidden">
          <Image
            src={imageMain}
            alt={name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium mb-1 line-clamp-2">{name}</h3>
          <div className="flex justify-between items-end mt-2">
            <div className="text-sm text-gray-600">
              {category && <span>{category}</span>}
              {country && <span className="block text-gray-500">{country}</span>}
            </div>
            <div className="text-lg font-bold text-wine-800">
              {formatPrice(price)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}