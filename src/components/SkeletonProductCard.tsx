// src/components/SkeletonProductCard.tsx
import React from 'react';

interface SkeletonProductCardProps {
  animated?: boolean;
}

const SkeletonProductCard: React.FC<SkeletonProductCardProps> = ({ 
  animated = true 
}) => {
  const animationClass = animated ? 'animate-pulse' : '';
  
  return (
    <div className="product-card h-full">
      {/* Card Header with Skeleton Title */}
      <div className="product-card-header">
        <div className={`h-6 bg-neutral-200 rounded-md w-4/5 mx-auto ${animationClass}`} />
      </div>
      
      {/* Card Body with Skeleton Image and Content */}
      <div className="product-card-body">
        {/* Skeleton Image Container */}
        <div className="product-card-image-container">
          <div className={`w-full h-full bg-neutral-200 rounded-md ${animationClass}`} />
        </div>

        {/* Skeleton Content Section */}
        <div className="product-card-content">
          {/* Skeleton Aroma Section */}
          <div className="product-card-section">
            <div className={`h-3 bg-neutral-200 rounded-md w-16 mb-2 ${animationClass}`} />
            <div className={`h-4 bg-neutral-200 rounded-md w-full ${animationClass}`} />
            <div className={`h-4 bg-neutral-200 rounded-md w-4/5 mt-1 ${animationClass}`} />
          </div>
          
          {/* Skeleton Taste Section */}
          <div className="product-card-section mt-4">
            <div className={`h-3 bg-neutral-200 rounded-md w-16 mb-2 ${animationClass}`} />
            <div className={`h-4 bg-neutral-200 rounded-md w-full ${animationClass}`} />
            <div className={`h-4 bg-neutral-200 rounded-md w-3/4 mt-1 ${animationClass}`} />
          </div>
        </div>
      </div>

      {/* Skeleton Card Footer */}
      <div className="product-card-footer">
        <div className="product-card-details">
          {/* Skeleton Category and Country */}
          <div className="product-card-info-line">
            <div className={`h-4 bg-neutral-200 rounded-md w-1/3 ${animationClass}`} />
            <div className={`h-4 bg-neutral-200 rounded-md w-1/4 ${animationClass}`} />
          </div>
          
          {/* Skeleton Price and Producer */}
          <div className="product-card-info-line mt-2">
            <div className={`h-5 bg-neutral-200 rounded-md w-1/4 ${animationClass}`} />
            <div className={`h-4 bg-neutral-200 rounded-md w-1/3 ${animationClass}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonProductCard;