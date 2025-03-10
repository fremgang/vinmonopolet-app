// src/components/product/SimpleProductList.tsx
import React from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard'; 

interface SimpleProductListProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const SimpleProductList = ({ products, onProductClick }: SimpleProductListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <div key={product.product_id} className="h-full">
          <ProductCard 
            product={product}
            onClick={() => onProductClick(product)}
          />
        </div>
      ))}
      
      {/* Add an empty div at the end for the infinite scroll loader */}
      <div className="col-span-full h-20" id="infinite-scroll-marker"></div>
    </div>
  );
};

export default SimpleProductList;