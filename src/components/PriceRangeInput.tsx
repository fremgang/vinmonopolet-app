// src/components/PriceRangeInput.tsx
import React, { useState, useEffect } from 'react';
import { Input, Spacer, Text } from '@geist-ui/core';

interface PriceRangeInputProps {
  minPrice: number;
  maxPrice: number;
  onPriceRangeChange: (minPrice: number, maxPrice: number) => void;
  absoluteMax?: number;
}

export default function PriceRangeInput({
  minPrice,
  maxPrice,
  onPriceRangeChange,
  absoluteMax = 500000
}: PriceRangeInputProps) {
  // Local state for input values
  const [minValue, setMinValue] = useState<string>(minPrice.toString());
  const [maxValue, setMaxValue] = useState<string>(
    maxPrice === absoluteMax ? 'No limit' : maxPrice.toString()
  );
  
  // Update local state when props change
  useEffect(() => {
    setMinValue(minPrice.toString());
    setMaxValue(maxPrice === absoluteMax ? 'No limit' : maxPrice.toString());
  }, [minPrice, maxPrice, absoluteMax]);
  
  // Format price for display
  const formatPrice = (value: string | number): string => {
    if (value === 'No limit') return value;
    
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(numValue)) return '0';
    
    return new Intl.NumberFormat('no-NO').format(numValue);
  };
  
  // Handle min price change
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setMinValue(value);
  };
  
  // Handle max price change
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow either digits or "No limit"
    const input = e.target.value;
    if (input === 'No limit') {
      setMaxValue(input);
      return;
    }
    
    const value = input.replace(/[^0-9]/g, '');
    setMaxValue(value);
  };
  
  // Process and apply price range when input loses focus
  const handleBlur = () => {
    let min = parseInt(minValue, 10) || 0;
    let max = maxValue === 'No limit' ? absoluteMax : (parseInt(maxValue, 10) || absoluteMax);
    
    // Enforce minimum value is at least 0
    min = Math.max(0, min);
    
    // Enforce maximum value constraints
    max = Math.min(Math.max(min, max), absoluteMax);
    
    // Special case: user has explicitly set "No limit"
    if (maxValue === 'No limit') {
      max = absoluteMax;
    }
    
    // Update the displayed values
    setMinValue(min.toString());
    setMaxValue(max === absoluteMax ? 'No limit' : max.toString());
    
    // Apply the changes
    onPriceRangeChange(min, max);
  };
  
  // Set to maximum range
  const handleResetToMaxRange = () => {
    setMinValue('0');
    setMaxValue('No limit');
    onPriceRangeChange(0, absoluteMax);
  };
  
  // Set to common price ranges
  const handleSetPriceRange = (min: number, max: number) => {
    setMinValue(min.toString());
    setMaxValue(max === absoluteMax ? 'No limit' : max.toString());
    onPriceRangeChange(min, max);
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center mb-2">
        <Text small className="text-gray-600 dark:text-gray-400">Price range (NOK)</Text>
        <button 
          onClick={handleResetToMaxRange}
          className="ml-auto text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Reset
        </button>
      </div>
      
      <div className="flex items-center">
        <Input 
                  value={minValue}
                  onChange={handleMinChange}
                  onBlur={handleBlur}
                  placeholder="Min"
                  width="100%"
                  className="min-w-0"
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined} crossOrigin={undefined}        />
        <div className="mx-2 text-gray-500">—</div>
        <Input 
                  value={maxValue}
                  onChange={handleMaxChange}
                  onBlur={handleBlur}
                  placeholder="Max"
                  width="100%"
                  className="min-w-0"
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined} crossOrigin={undefined}        />
      </div>
      
      <Spacer h={0.5} />
      
      <div className="flex flex-wrap gap-2 mt-2">
        <button 
          onClick={() => handleSetPriceRange(0, 500)}
          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
        >
          Under 500
        </button>
        <button 
          onClick={() => handleSetPriceRange(500, 1000)}
          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
        >
          500 - 1,000
        </button>
        <button 
          onClick={() => handleSetPriceRange(1000, 2000)}
          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
        >
          1,000 - 2,000
        </button>
        <button 
          onClick={() => handleSetPriceRange(2000, 5000)}
          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
        >
          2,000 - 5,000
        </button>
        <button 
          onClick={() => handleSetPriceRange(5000, absoluteMax)}
          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
        >
          Over 5,000
        </button>
      </div>
    </div>
  );
}