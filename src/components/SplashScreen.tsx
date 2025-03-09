// src/components/SplashScreen.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Text } from '@geist-ui/core';

interface SplashScreenProps {
  redirectPath?: string;
  loadingTime?: number; // in seconds
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  redirectPath = '/',
  loadingTime = 5
}) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(loadingTime);
  const [fillPercent, setFillPercent] = useState(0);

  useEffect(() => {
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
    
    // Redirect after loading time
    const redirectTimeout = setTimeout(() => {
      router.push(redirectPath);
    }, loadingTime * 1000);
    
    return () => {
      clearInterval(secondInterval);
      clearInterval(fillInterval);
      clearTimeout(redirectTimeout);
    };
  }, [loadingTime, redirectPath, router]);

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
              
              {/* Glass */}
              <path d="M20,20 Q20,80 50,80 Q80,80 80,20" stroke="#8c1c13" />
            </svg>
            
            {/* Wine Fill */}
            <div 
              className="absolute bottom-14 left-5 right-5 bg-wine-red transition-all duration-100 ease-linear rounded-b-full overflow-hidden"
              style={{ 
                height: `${fillPercent * 0.6}%`,
                maxHeight: '60%',
                opacity: 0.9
              }}
            />
          </div>
        </div>
        
        <Text className="text-neutral-600">
          Ready in <span className="font-bold text-wine-red">{countdown}</span> seconds...
        </Text>
      </div>
    </div>
  );
};

export default SplashScreen;