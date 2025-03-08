import React from 'react';
import Image from 'next/image';
import { Card, Text, Badge, Tooltip } from '@geist-ui/core';
import { Globe, Wine, Award, Smile, PenTool, Droplet, Package } from 'lucide-react';

// Import the Product interface
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
    district,
    sub_district,
    producer,
    varetype,
    lukt,
    smak,
    farge,
    emballasjetype,
    utvalg,
    imageMain
  } = product;

  // Function to format price with Norwegian format
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK' }).format(price);
  };

  // Function to handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/wine-placeholder.svg'; // Replace with your placeholder image
  };

  return (
    <Card 
      hoverable 
      className="product-card transition-all duration-200 hover:shadow-lg"
      onClick={onClick}
    >
      <div className={`relative ${isGrid ? 'h-64' : 'h-auto md:flex gap-6 p-2'}`}>
        <div 
          className={`
            ${isGrid ? 'h-48 w-full' : 'md:w-1/3 h-64 flex-shrink-0'} 
            relative rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800
          `}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={imageMain}
              alt={name}
              fill
              className="object-contain p-2 transition-opacity"
              sizes={isGrid ? "33vw" : "50vw"}
              priority={false}
              onError={handleImageError}
            />
          </div>
        </div>
        
        <div className={`${isGrid ? 'mt-4' : 'md:w-2/3'} flex flex-col h-full`}>
          <div>
            <Text h4 my={0} className="line-clamp-2 font-medium">{name}</Text>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {category && (
                <Badge type="default" scale={0.7}>{category}</Badge>
              )}
              
              {country && (
                <Badge type="success" scale={0.7}>
                  <span className="flex items-center">
                    <Globe size={12} className="mr-1" />{country}
                  </span>
                </Badge>
              )}
              
              {utvalg && (
                <Badge type="warning" scale={0.7}>
                  <span className="flex items-center">
                    <Award size={12} className="mr-1" />{utvalg}
                  </span>
                </Badge>
              )}
            </div>
          </div>
          
          {!isGrid && (
            <div className="mt-3 text-sm space-y-2 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {district && (
                  <div className="flex items-start">
                    <Globe size={14} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                    <span>
                      <b>District:</b> {district}
                      {sub_district && <span className="block text-xs text-gray-500">{sub_district}</span>}
                    </span>
                  </div>
                )}
                
                {producer && (
                  <div className="flex items-start">
                    <Wine size={14} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                    <span><b>Producer:</b> {producer}</span>
                  </div>
                )}
                
                {varetype && (
                  <div className="flex items-start">
                    <PenTool size={14} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                    <span><b>Type:</b> {varetype}</span>
                  </div>
                )}
                
                {farge && (
                  <div className="flex items-start">
                    <Droplet size={14} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                    <span><b>Color:</b> {farge}</span>
                  </div>
                )}
              </div>
              
              {lukt && (
                <div className="flex items-start">
                  <Smile size={14} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <b>Aroma:</b> 
                    <div className="line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                      {lukt}
                    </div>
                  </div>
                </div>
              )}
              
              {smak && (
                <div className="flex items-start">
                  <Smile size={14} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <b>Taste:</b> 
                    <div className="line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                      {smak}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className={`mt-${isGrid ? '2' : 'auto'}`}>
            <Text h3 className="text-xl font-bold">
              {formatPrice(price)}
            </Text>
            <div className="text-xs text-gray-500">
              Product ID: {product_id}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}