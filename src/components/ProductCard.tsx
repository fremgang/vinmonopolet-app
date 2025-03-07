import React from 'react';
import Image from 'next/image';
import { Card, Text, Tag, Tooltip } from '@geist-ui/core';
import { Globe, Wine, Award, Smile, PenTool, Droplet, Package } from 'lucide-react';

// Import the Product interface
import { Product } from '../app/api/products/route';

interface ProductCardProps {
  product: Product & {
    imageSmall: string;
    imageMain: string;
  };
  isGrid: boolean;
}

export default function ProductCard({ product, isGrid }: ProductCardProps) {
  const {
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
    utvalg
  } = product;

  // Function to format price with Norwegian format
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `${price.toLocaleString('no-NO')} kr`;
  };

  return (
    <Card hoverable className="product-card transition-all duration-200">
      <div className={`relative ${isGrid ? 'h-64' : 'h-80 md:flex gap-6'}`}>
        <div className={`${isGrid ? 'h-full w-full' : 'md:w-1/3 h-full flex-shrink-0'} relative`}>
          <Image
            src={product.imageMain}
            alt={name}
            fill
            className="object-contain p-2"
            sizes={isGrid ? "33vw" : "50vw"}
            priority={false}
          />
        </div>
        
        <div className={`${isGrid ? 'mt-4' : 'md:w-2/3'} flex flex-col`}>
          <Text h4 my={0}>{name}</Text>
          
          {/* Category & Origin */}
          <div className="flex flex-wrap gap-1 mt-2">
            {category && (
              <Tooltip text="Category" placement="bottom">
                <Tag type="default">{category}</Tag>
              </Tooltip>
            )}
            {country && (
              <Tooltip text="Country" placement="bottom">
                <Tag type="success"><Globe size={12} className="mr-1" />{country}</Tag>
              </Tooltip>
            )}
            {utvalg && (
              <Tooltip text="Selection" placement="bottom">
                <Tag type="warning"><Award size={12} className="mr-1" />{utvalg}</Tag>
              </Tooltip>
            )}
          </div>
          
          {/* Price */}
          <Text h3 my={1} className="text-xl font-bold mt-auto">
            {formatPrice(price)}
          </Text>
          
          {/* Additional Details - Shows when there's more space in list view */}
          {!isGrid && (
            <div className="mt-2 text-sm space-y-1">
              {district && (
                <div className="flex items-center">
                  <Globe size={16} className="mr-2 text-gray-500" />
                  <span><b>District:</b> {district}{sub_district ? `, ${sub_district}` : ''}</span>
                </div>
              )}
              
              {producer && (
                <div className="flex items-center">
                  <Wine size={16} className="mr-2 text-gray-500" />
                  <span><b>Producer:</b> {producer}</span>
                </div>
              )}
              
              {varetype && (
                <div className="flex items-center">
                  <PenTool size={16} className="mr-2 text-gray-500" />
                  <span><b>Type:</b> {varetype}</span>
                </div>
              )}
              
              {(lukt || smak) && (
                <div className="flex items-center">
                  <Smile size={16} className="mr-2 text-gray-500" />
                  <span>
                    {lukt && <span><b>Aroma:</b> {lukt.substring(0, 100)}{lukt.length > 100 ? '...' : ''}</span>}
                    {lukt && smak && <span className="mx-1">•</span>}
                    {smak && <span><b>Taste:</b> {smak.substring(0, 100)}{smak.length > 100 ? '...' : ''}</span>}
                  </span>
                </div>
              )}
              
              {farge && (
                <div className="flex items-center">
                  <Droplet size={16} className="mr-2 text-gray-500" />
                  <span><b>Color:</b> {farge}</span>
                </div>
              )}
              
              {emballasjetype && (
                <div className="flex items-center">
                  <Package size={16} className="mr-2 text-gray-500" />
                  <span><b>Packaging:</b> {emballasjetype}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}