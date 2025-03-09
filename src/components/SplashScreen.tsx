// src/components/SplashScreen.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Text } from '@geist-ui/core';

interface SplashScreenProps {
  redirectPath?: string;
  loadingTime?: number; // in seconds
  onPreload?: () => Promise<void>; // Add a preload callback
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  redirectPath = '/',
  loadingTime = 5, // Default 5 seconds
  onPreload = async () => {} // Default empty function
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
    
    // Redirect after loading time - ENSURING a full 5 seconds passes
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
    <div className="fixed inset-0 bg-neutral-50 flex flex-col items-center justify-center z-50">
      <div className="text-center max-w-md px-4">
        <h1 className="font-serif text-3xl font-bold text-wine-red mb-6">
          Vinmonopolet Explorer
        </h1>
        
        <Text p className="text-neutral-700 mb-8">
          Loading your premium wine and spirits experience...
        </Text>
        
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-40">
            {/* Wine Glass Outline */}
            <svg 
              viewBox="0 0 100 140" 
              className="absolute inset-0 w-full h-full" 
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
            >
              {/* Stem and Base */}
              <path d="M50,80 L50,120 M30,130 L70,130" stroke="#8c1c13" />
              
              {/* Glass Bowl */}
              <path d="M20,20 Q20,80 50,80 Q80,80 80,20" stroke="#8c1c13" />
            </svg>
            
            {/* Improved Wine Fill - better matches glass shape */}
            <div 
              className="absolute bg-wine-red transition-all duration-100 ease-linear rounded-b-full overflow-hidden"
              style={{ 
                bottom: '60px', // Positioned at bottom of bowl
                left: '25px',   // Aligned with left of bowl
                right: '25px',  // Aligned with right of bowl
                borderRadius: '0 0 100% 100%', // Curved bottom like a wine
                height: `${Math.min(fillPercent * 0.6, 60)}px`, // Scale to max height
                maxHeight: '60px', // Max height of wine
                opacity: 0.9
              }}
            />
          </div>
        </div>
        
        <Text className="text-neutral-600">
          Ready in <span className="font-bold text-wine-red">{countdown}</span> seconds...
        </Text>
        
        {preloadComplete && (
          <Text small className="text-green-600 mt-2">
            Resources loaded, preparing your experience...
          </Text>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;