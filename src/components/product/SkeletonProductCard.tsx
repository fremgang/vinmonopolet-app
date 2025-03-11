// src/components/product/SkeletonProductCard.tsx
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

interface SkeletonProductCardProps {
  animated?: boolean;
}

const SkeletonProductCard: React.FC<SkeletonProductCardProps> = ({ 
  animated = true 
}) => {
  const animationClass = animated ? 'animate-pulse' : '';
  
  return (
    <Card className="h-full w-full border border-gray-200 mx-auto">
      {/* Card Header with Skeleton Title */}
      <CardHeader className="pb-2 px-4 pt-4 border-b border-neutral-100">
        <div className={`h-5 bg-neutral-200 rounded-md w-4/5 mx-auto ${animationClass}`}></div>
        <div className={`h-4 bg-neutral-200 rounded-md w-2/3 mx-auto mt-2 ${animationClass}`}></div>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex flex-col h-full">
          {/* Center product image placeholder */}
          <div className="flex justify-center mb-3">
            <div className={`h-[150px] w-[110px] bg-neutral-200 rounded-md ${animationClass}`}></div>
          </div>
          
          {/* Taste section placeholder */}
          <div className="flex-grow">
            <div className={`h-3 bg-neutral-200 rounded-md w-24 mb-3 ${animationClass}`}></div>
            <div className={`h-3 bg-neutral-200 rounded-md w-full ${animationClass}`}></div>
            <div className={`h-3 bg-neutral-200 rounded-md w-full mt-1 ${animationClass}`}></div>
            <div className={`h-3 bg-neutral-200 rounded-md w-3/4 mt-1 ${animationClass}`}></div>
            
            {/* Location info placeholder */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <div className={`h-3 w-3 bg-neutral-300 rounded-full mr-2 ${animationClass}`}></div>
                <div className={`h-3 bg-neutral-200 rounded-md w-1/2 ${animationClass}`}></div>
              </div>
              <div className="flex items-center">
                <div className={`h-3 w-3 bg-neutral-300 rounded-full mr-2 ${animationClass}`}></div>
                <div className={`h-3 bg-neutral-200 rounded-md w-2/3 ${animationClass}`}></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="mt-auto bg-neutral-50 border-t p-3 flex justify-between items-center">
        <div className={`h-5 bg-neutral-200 rounded-md w-16 ${animationClass}`}></div>
        <div className={`h-3 bg-neutral-200 rounded-md w-8 ${animationClass}`}></div>
      </CardFooter>
    </Card>
  );
};

export default SkeletonProductCard;