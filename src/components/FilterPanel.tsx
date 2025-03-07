import React, { useState, useEffect } from 'react';
import { Select, Slider, Button, Grid, Spacer } from '@geist-ui/core';
import { X } from 'lucide-react';

// Common countries and categories for wine
const COMMON_COUNTRIES = [
  'France', 'Italy', 'Spain', 'Portugal', 'Germany', 
  'USA', 'Chile', 'Argentina', 'Australia', 'New Zealand',
  'South Africa', 'Norway'
];

const COMMON_CATEGORIES = [
  'Red Wine', 'White Wine', 'Rosé Wine', 'Sparkling Wine', 
  'Dessert Wine', 'Fortified Wine', 'Whisky', 'Vodka', 
  'Gin', 'Rum', 'Tequila', 'Brandy', 'Beer', 'Cider'
];

interface FilterPanelProps {
  filters: {
    countries: string[];
    categories: string[];
    priceRange: [number, number];
  };
  onUpdateFilters: (newFilters: Partial<FilterPanelProps['filters']>) => void;
}

export default function FilterPanel({ filters, onUpdateFilters }: FilterPanelProps) {
  // Local state for country and category multiple select
  const [selectedCountries, setSelectedCountries] = useState<string[]>(filters.countries);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filters.categories);
  const [priceRange, setPriceRange] = useState<[number, number]>(filters.priceRange);
  
  // Apply filters
  const handleApplyFilters = () => {
    onUpdateFilters({
      countries: selectedCountries,
      categories: selectedCategories,
      priceRange: priceRange
    });
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setSelectedCountries([]);
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
    
    onUpdateFilters({
      countries: [],
      categories: [],
      priceRange: [0, 10000]
    });
  };
  
  // Update local state when props change
  useEffect(() => {
    setSelectedCountries(filters.countries);
    setSelectedCategories(filters.categories);
    setPriceRange(filters.priceRange);
  }, [filters]);
  
  // Handle country selection
  const handleCountryChange = (values: string | string[]) => {
    setSelectedCountries(Array.isArray(values) ? values : [values]);
  };
  
  // Handle category selection
  const handleCategoryChange = (values: string | string[]) => {
    setSelectedCategories(Array.isArray(values) ? values : [values]);
  };
  
  // Handle price range change
  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };
  
  return (
    <div>
      <Grid.Container gap={2}>
        <Grid xs={24} md={8}>
          <div className="w-full">
            <label className="block mb-2 text-sm font-medium">Country</label>
            <Select 
              placeholder="Select countries"
              multiple
              width="100%"
              value={selectedCountries}
              onChange={handleCountryChange}
              onPointerEnterCapture={undefined} 
              onPointerLeaveCapture={undefined}
            >
              {COMMON_COUNTRIES.map(country => (
                <Select.Option key={country} value={country}>{country}</Select.Option>
              ))}
            </Select>
          </div>
        </Grid>
        
        <Grid xs={24} md={8}>
          <div className="w-full">
            <label className="block mb-2 text-sm font-medium">Category</label>
            <Select 
              placeholder="Select categories"
              multiple
              width="100%"
              value={selectedCategories}
              onChange={handleCategoryChange}
              onPointerEnterCapture={undefined} 
              onPointerLeaveCapture={undefined}
            >
              {COMMON_CATEGORIES.map(category => (
                <Select.Option key={category} value={category}>{category}</Select.Option>
              ))}
            </Select>
          </div>
        </Grid>
        
        <Grid xs={24} md={8}>
          <div className="w-full">
            <label className="block mb-2 text-sm font-medium">
              Price Range: {priceRange[0]} - {priceRange[1]} NOK
            </label>
            <Slider 
              value={priceRange as any}
              onChange={(val: any) => handlePriceChange(val)}
              min={0}
              max={10000}
              step={100}
              initialValue={[0, 10000] as any}
              onPointerOverCapture={undefined} 
              onPointerMoveCapture={undefined}
              type="secondary"
            />
          </div>
        </Grid>
      </Grid.Container>
      
      <div className="flex justify-end mt-4 gap-2">
        <Button 
          auto 
          scale={2/3} 
          type="abort" 
          icon={<X size={16} />}
          onClick={handleResetFilters}
          onPointerEnterCapture={undefined} 
          onPointerLeaveCapture={undefined}
          placeholder={undefined}
        >
          Reset
        </Button>
        <Button 
          auto 
          type="success" 
          scale={2/3}
          onClick={handleApplyFilters}
          onPointerEnterCapture={undefined} 
          onPointerLeaveCapture={undefined}
          placeholder={undefined}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}