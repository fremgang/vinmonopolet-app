// src/components/layout/SplashScreen.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SplashScreenProps {
  redirectPath?: string;
  loadingTime?: number; // in seconds
  onPreload?: () => Promise<boolean | void>;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  redirectPath = '/',
  loadingTime = 5, // Default 5 seconds
  onPreload = async () => {}
}) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(loadingTime);
  const [fillPercent, setFillPercent] = useState(0);
  const [preloadComplete, setPreloadComplete] = useState(false);

  useEffect(() => {
    // Start preloading data immediately
    const startPreload = async () => {
      try {
        await onPreload();
        setPreloadComplete(true);
      } catch (error) {
        console.error('Error during preload:', error);
        // Still mark as complete so we don't block the app
        setPreloadComplete(true);
      }
    };
    
    startPreload();
    
    // Calculate how much to fill per interval (100% divided by total seconds * 10 for smoothness)
    const fillPerInterval = 100 / (loadingTime * 10);
    
    // Update countdown every second
    const secondInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(secondInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Update fill animation more frequently for smoothness
    const fillInterval = setInterval(() => {
      setFillPercent(prev => {
        if (prev >= 100) {
          clearInterval(fillInterval);
          return 100;
        }
        return prev + fillPerInterval;
      });
    }, 100); // 10 times per second
    
    // Redirect after loading time - ENSURING a full loadingTime passes
    const redirectTimeout = setTimeout(() => {
      router.push(redirectPath);
    }, loadingTime * 1000);
    
    return () => {
      clearInterval(secondInterval);
      clearInterval(fillInterval);
      clearTimeout(redirectTimeout);
    };
  }, [loadingTime, redirectPath, router, onPreload]);

  return (
    <div className="fixed inset-0 bg-cream flex flex-col items-center justify-center z-50">
      <div className="text-center max-w-md px-4">
        {/* Logo/App Name */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-serif text-4xl font-bold text-wine-red mb-2">
            Vinmonopolet Explorer
          </h1>
          <p className="text-neutral-700">
            Discover Norway`&apos;`s finest wines & spirits
          </p>
        </div>
        
        {/* Wine Bottle Animation */}
        <div className="relative w-32 h-40 mx-auto mb-8">
          <svg 
            viewBox="0 0 100 160" 
            className="absolute inset-0 w-full h-full" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Bottle outline */}
            <path 
              d="M35,10 h30 v20 c0,0 5,5 5,10 v100 c0,10 -40,10 -40,0 v-100 c0,-5 5,-10 5,-10 z" 
              stroke="#8c1c13" 
              strokeWidth="2" 
              fill="white" 
            />
            
            {/* Wine fill - using a clipPath for proper animation */}
            <defs>
              <clipPath id="bottle-mask">
                <path d="M35,30 c0,-5 5,-10 5,-10 h20 c0,0 5,5 5,10 v100 c0,10 -30,10 -30,0 z" />
              </clipPath>
              
              {/* Wine gradient definition */}
              <linearGradient id="wine-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8c1c13" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#b32c1b" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            
            {/* Rectangle that gets clipped by the bottle shape */}
            <rect 
              x="30" 
              y="30" 
              width="40" 
              height="110" 
              fill="url(#wine-gradient)" 
              clipPath="url(#bottle-mask)"
              style={{
                // This rectangle starts at full height and we scale it based on fill percentage
                // using CSS transform directly in the style attribute
                transform: `scaleY(${fillPercent/100})`,
                transformBox: "fill-box",
                transformOrigin: "bottom"
              }}
            />
          </svg>
        </div>
        
        {/* Loading progress indicator */}
        <div className="bg-white bg-opacity-80 rounded-lg py-3 px-4 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-neutral-600">Loading your experience...</span>
            <span className="font-medium text-wine-red">{`${Math.round(fillPercent)}%`}</span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-wine-red to-wine-red-light transition-all duration-200 ease-out"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>
        
        {/* Status message - only shown when preload is complete */}
        {preloadComplete && (
          <p className="text-sm text-green-600 mt-3">
            Resources loaded, preparing your experience...
          </p>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;