import React from 'react';
import { Modal, Button, Tag } from '@geist-ui/core';
import { X, ShoppingBag, Globe, MapPin, Wine } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/types';

interface ProductModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({ product, visible, onClose }: ProductModalProps) {
  if (!product) return null;

  // Function to format price with Norwegian format
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK' }).format(price);
  };

  function getCachedImageUrl(imageMain: string): string | import("next/dist/shared/lib/get-img-props").StaticImport {
    throw new Error('Function not implemented.');
  }

  return (
    <Modal visible={visible} onClose={onClose} width="42rem">
      <Modal.Title>
        <div className="flex justify-between items-center w-full pr-8">
          <span>{product.name}</span>
          <Button 
            auto 
            icon={<X />} 
            type="abort" 
            scale={2/3} 
            onClick={onClose}
            className="absolute right-5 top-5"
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            placeholder={undefined}
          />
        </div>
      </Modal.Title>
      
      <Modal.Content>
        <div className="flex flex-col md:flex-row gap-6">
          
          <div className="w-full md:w-2/5">
            <div className="aspect-[4/3] relative bg-gray-50 rounded-lg overflow-hidden">
            <Image
            src={getCachedImageUrl(product.imageMain)}
            alt={product.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 640px) 100vw, 33vw"
            />
            </div>
          </div>
          
          {/* Product Details */}
          <div className="w-full md:w-3/5">
            <div className="flex flex-wrap gap-2 mb-3">
              {product.category && (
                <Tag type="default">{product.category}</Tag>
              )}
              {product.country && (
                <Tag type="success">
                  <Globe size={14} className="mr-1" />
                  {product.country}
                </Tag>
              )}
              {product.utvalg && (
                <Tag type="warning">{product.utvalg}</Tag>
              )}
            </div>
            
            <div className="text-2xl font-bold text-wine-800 dark:text-wine-400 mb-4">
              {formatPrice(product.price)}
            </div>
            
            {/* Main details */}
            <div className="space-y-3 mb-4">
              {(product.district || product.sub_district) && (
                <div className="flex items-start">
                  <MapPin size={18} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Region</span>
                    <div className="text-gray-600">
                      {product.district}
                      {product.sub_district && `, ${product.sub_district}`}
                    </div>
                  </div>
                </div>
              )}
              
              {product.producer && (
                <div className="flex items-start">
                  <Wine size={18} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Producer</span>
                    <div className="text-gray-600">{product.producer}</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Taste profile */}
            {(product.lukt || product.smak) && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Taste Profile</h3>
                {product.lukt && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Aroma:</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.lukt}</p>
                  </div>
                )}
                {product.smak && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Taste:</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.smak}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal.Content>
      
      <Modal.Action 
        passive 
        onClick={onClose}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        placeholder={undefined}
      >
        Close
      </Modal.Action>
      <Modal.Action
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        placeholder={undefined}
      >
        <a 
          href={`https://www.vinmonopolet.no/search?q=${encodeURIComponent(product.name)}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center"
        >
          <ShoppingBag size={16} className="mr-2" />
          View on Vinmonopolet
        </a>
      </Modal.Action>
    </Modal>
  );
}