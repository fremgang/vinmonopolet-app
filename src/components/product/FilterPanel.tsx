import React, { useState, useEffect } from 'react';
import { Button, Badge } from '@geist-ui/core';
import { X, Filter, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';
import PriceRangeInput from '../PriceRangeInput';

// Common countries and categories
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

export default function FilterPanel({ 
  filters, 
  onUpdateFilters
}: FilterPanelProps) {
  // Local state
  const [selectedCountries, setSelectedCountries] = useState<string[]>(filters.countries);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filters.categories);
  const [priceRange, setPriceRange] = useState<[number, number]>(filters.priceRange);
  const [countryExpanded, setCountryExpanded] = useState(true);
  const [categoryExpanded, setCategoryExpanded] = useState(true);
  const [priceExpanded, setPriceExpanded] = useState(true);
  
  // Maximum price range - effectively no limit
  const MAX_PRICE = 100000;
  
  // Update active filter count
  const activeFilterCount = 
    selectedCountries.length + 
    selectedCategories.length + 
    (priceRange[0] > 0 || priceRange[1] < MAX_PRICE ? 1 : 0);
  
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
    setPriceRange([0, MAX_PRICE]);
    
    onUpdateFilters({
      countries: [],
      categories: [],
      priceRange: [0, MAX_PRICE]
    });
  };
  
  // Update local state when props change
  useEffect(() => {
    setSelectedCountries(filters.countries);
    setSelectedCategories(filters.categories);
    setPriceRange(filters.priceRange);
  }, [filters]);
  
  // Toggle country selection
  const toggleCountry = (country: string) => {
    setSelectedCountries(prev => 
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };
  
  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Handle price range change
  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange([min, max]);
  };
  
  return (
    <div className="p-5 bg-white rounded-lg shadow-sm border border-neutral-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-serif font-semibold flex items-center text-neutral-800">
          <Filter size={18} className="mr-2 text-wine-red" /> 
          Filters
          {activeFilterCount > 0 && (
            <Badge type="warning" className="ml-2">{activeFilterCount}</Badge>
          )}
        </h3>
      </div>
      
      {/* Country filter */}
      <div className="mb-6 border-b border-neutral-200 pb-4">
        <button 
          onClick={() => setCountryExpanded(!countryExpanded)}
          className="flex justify-between items-center w-full text-left font-medium mb-3 text-neutral-700"
        >
          Country
          {countryExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {countryExpanded && (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              {COMMON_COUNTRIES.map(country => (
                <button
                  key={country}
                  onClick={() => toggleCountry(country)}
                  className={`filter-chip ${selectedCountries.includes(country) ? 'active' : ''}`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Category filter */}
      <div className="mb-6 border-b border-neutral-200 pb-4">
        <button 
          onClick={() => setCategoryExpanded(!categoryExpanded)}
          className="flex justify-between items-center w-full text-left font-medium mb-3 text-neutral-700"
        >
          Category
          {categoryExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {categoryExpanded && (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              {COMMON_CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`filter-chip ${selectedCategories.includes(category) ? 'active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Price range filter */}
      <div className="mb-6">
        <button 
          onClick={() => setPriceExpanded(!priceExpanded)}
          className="flex justify-between items-center w-full text-left font-medium mb-3 text-neutral-700"
        >
          Price Range
          {priceExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {priceExpanded && (
          <div className="mt-3">
            <PriceRangeInput
              minPrice={priceRange[0]}
              maxPrice={priceRange[1]}
              onPriceRangeChange={handlePriceRangeChange}
              absoluteMax={MAX_PRICE}
            />
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between mt-6">
        {activeFilterCount > 0 && (
          <Button 
            auto
            type="warning"
            icon={<RefreshCw size={14} />}
            onClick={handleResetFilters}
            className="flex-1 mr-2" 
            placeholder={undefined} 
            onPointerEnterCapture={undefined} 
            onPointerLeaveCapture={undefined}
          >
            Reset
          </Button>
        )}
        <Button 
          auto
          type="success"
          style={{
            backgroundColor: 'var(--wine-red)',
            borderColor: 'var(--wine-red-light)'
          }}
          onClick={handleApplyFilters}
          className={activeFilterCount > 0 ? "flex-1" : "w-full"} 
          placeholder={undefined} 
          onPointerEnterCapture={undefined} 
          onPointerLeaveCapture={undefined}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}