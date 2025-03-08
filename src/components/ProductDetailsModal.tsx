import React from 'react';
import { Modal, Description, Divider, Button, Tag, Grid } from '@geist-ui/core';
import { X, ShoppingBag, Globe, MapPin, Wine, Award, Smile, PenTool, Droplet, Package } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/app/page';

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

  return (
    <Modal visible={visible} onClose={onClose}>
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
        <Grid.Container gap={2}>
          <Grid xs={24} sm={10}>
            <div className="relative w-full h-80 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src={product.imageMain}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
          </Grid>
          
          <Grid xs={24} sm={14}>
            <div className="space-y-4 w-full">
              <div>
                <h2 className="text-2xl font-bold">{product.name}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
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
                    <Tag type="warning">
                      <Award size={14} className="mr-1" />
                      {product.utvalg}
                    </Tag>
                  )}
                </div>
              </div>
              
              <div className="text-2xl font-bold text-wine-800 dark:text-wine-400">
                {formatPrice(product.price)}
              </div>
              
              <Description title="Product ID" content={product.product_id} />
              
              {(product.district || product.sub_district) && (
                <div className="flex items-start">
                  <MapPin size={18} className="mr-2 text-gray-500 mt-1" />
                  <div>
                    <span className="font-medium">Region</span>
                    <div className="text-gray-600 dark:text-gray-300">
                      {product.district}
                      {product.sub_district && (
                        <span>, {product.sub_district}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {product.producer && (
                <div className="flex items-start">
                  <Wine size={18} className="mr-2 text-gray-500 mt-1" />
                  <div>
                    <span className="font-medium">Producer</span>
                    <div className="text-gray-600 dark:text-gray-300">
                      {product.producer}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Grid>
        </Grid.Container>
        
        <Divider />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Details</h3>
          
          <Grid.Container gap={2}>
            {product.lukt && (
              <Grid xs={24} md={12}>
                <div className="flex items-start w-full">
                  <Smile size={18} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="flex-grow">
                    <span className="font-medium">Aroma</span>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">
                      {product.lukt}
                    </div>
                  </div>
                </div>
              </Grid>
            )}
            
            {product.smak && (
              <Grid xs={24} md={12}>
                <div className="flex items-start w-full">
                  <Smile size={18} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="flex-grow">
                    <span className="font-medium">Taste</span>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">
                      {product.smak}
                    </div>
                  </div>
                </div>
              </Grid>
            )}
            
            {product.farge && (
              <Grid xs={24} md={12}>
                <div className="flex items-start w-full">
                  <Droplet size={18} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="flex-grow">
                    <span className="font-medium">Color</span>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">
                      {product.farge}
                    </div>
                  </div>
                </div>
              </Grid>
            )}
            
            {product.varetype && (
              <Grid xs={24} md={12}>
                <div className="flex items-start w-full">
                  <PenTool size={18} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="flex-grow">
                    <span className="font-medium">Type</span>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">
                      {product.varetype}
                    </div>
                  </div>
                </div>
              </Grid>
            )}
            
            {product.metode && (
              <Grid xs={24} md={12}>
                <div className="flex items-start w-full">
                  <Wine size={18} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="flex-grow">
                    <span className="font-medium">Method</span>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">
                      {product.metode}
                    </div>
                  </div>
                </div>
              </Grid>
            )}
            
            {product.emballasjetype && (
              <Grid xs={24} md={12}>
                <div className="flex items-start w-full">
                  <Package size={18} className="mr-2 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="flex-grow">
                    <span className="font-medium">Packaging</span>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">
                      {product.emballasjetype}
                      {product.korktype && `, ${product.korktype}`}
                    </div>
                  </div>
                </div>
              </Grid>
            )}
          </Grid.Container>
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