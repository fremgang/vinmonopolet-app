import React from 'react';
import Image from 'next/image';
import { Card, Badge } from '@geist-ui/core';
import { Product } from '@/app/page';

interface ProductCardProps {
 product: Product;
 isGrid: boolean;
 onClick?: () => void;
}

export default function ProductCard({ product, isGrid = true, onClick }: ProductCardProps) {
  const isListView = !isGrid;
 const {
   product_id,
   name,
   category,
   country,
   price,
   varetype,
   lukt,
   smak,
   utvalg,
   imageMain
 } = product;

 // Function to format price with Norwegian format
 const formatPrice = (price: number | null) => {
   if (price === null) return 'N/A';
   return `${new Intl.NumberFormat('no-NO').format(price)} kr`;
 };

 // Function to handle image loading errors
 const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
   e.currentTarget.src = '/wine-placeholder.svg';
 };

 return (
   <Card
     hoverable
     className={`product-card transition-all duration-200 hover:shadow-lg bg-white 
       ${isListView ? 'flex items-center p-4' : ''}`}
     onClick={onClick}
   >
     {isListView ? (
       <>
         {/* List View Layout */}
         <div className="relative w-[100px] h-[150px] mr-4">
           <Image
             src={imageMain}
             alt={name}
             fill
             className="object-contain"
             sizes="100px"
             priority={false}
             onError={handleImageError}
           />
         </div>
         <div className="flex-grow">
           <h3 className="text-xl font-serif font-bold mb-2">{name}</h3>
           <div className="grid grid-cols-2 gap-2">
             {lukt && (
               <div>
                 <p className="text-sm font-semibold text-gray-700">Aroma:</p>
                 <p className="text-xs text-gray-600 line-clamp-2">{lukt}</p>
               </div>
             )}
             {smak && (
               <div>
                 <p className="text-sm font-semibold text-gray-700">Taste:</p>
                 <p className="text-xs text-gray-600 line-clamp-2">{smak}</p>
               </div>
             )}
           </div>
           <div className="mt-2 flex justify-between items-center">
             <p className="text-lg font-bold text-wine-800">{formatPrice(price)}</p>
             {varetype && (
               <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                 {varetype}
               </span>
             )}
           </div>
         </div>
       </>
     ) : (
       // Grid View Layout (previous implementation)
       <div className="flex flex-col h-full">
         <div className="flex h-2/3 items-center justify-center"> 
           <div className="w-1/2 flex items-center justify-center bg-white relative">
             <div className="relative w-[150px] h-[200px]">
               <Image
                 src={imageMain}
                 alt={name}
                 fill
                 className="object-contain"
                 sizes="(max-width: 768px) 100px, 150px"
                 priority={false}
                 onError={handleImageError}
               />
             </div>
           </div>
           <div className="w-1/2 p-3 flex flex-col justify-center"> 
             <h3 className="text-xl font-serif font-bold mb-3 line-clamp-2">{name}</h3>
             {lukt && (
               <div className="mb-2">
                 <p className="text-sm font-semibold text-gray-700 mb-0.5">Aroma:</p>
                 <p className="text-xs text-gray-600 line-clamp-3">{lukt}</p>
               </div>
             )}
             {smak && (
               <div className="mb-2">
                 <p className="text-sm font-semibold text-gray-700 mb-0.5">Taste:</p>
                 <p className="text-xs text-gray-600 line-clamp-3">{smak}</p>
               </div>
             )}
             <div className="mt-auto">
               <p className="text-lg font-bold text-wine-800">{formatPrice(price)}</p>
             </div>
           </div>
         </div>
       </div>
     )}
   </Card>
 );
}