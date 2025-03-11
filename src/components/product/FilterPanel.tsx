// src/components/product/FilterPanel.tsx
import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Filter, ChevronRight, ChevronDown, X } from 'lucide-react';
import PriceRangeInput from 'src/components/PriceRangeInput'; // Make sure this is also updated to use Shadcn UI

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
            <Badge variant="outline" className="ml-2 bg-amber-50">
              {activeFilterCount}
            </Badge>
          )}
        </h3>
        
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleResetFilters}
            className="h-8 px-2 text-sm text-neutral-500 hover:text-wine-red"
          >
            <RefreshCw size={14} className="mr-1" />
            Reset all
          </Button>
        )}
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
            {/* Selected countries as badges */}
            {selectedCountries.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedCountries.map(country => (
                  <Badge 
                    key={`selected-${country}`}
                    variant="secondary"
                    className="flex items-center gap-1 bg-wine-red bg-opacity-10 text-wine-red hover:bg-wine-red hover:bg-opacity-20"
                  >
                    {country}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleCountry(country);
                      }}
                      className="ml-1 rounded-full hover:bg-wine-red hover:bg-opacity-10 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {COMMON_COUNTRIES.map(country => (
                <button
                  key={country}
                  onClick={() => toggleCountry(country)}
                  className={`py-1 px-3 rounded-full text-sm border transition-colors ${
                    selectedCountries.includes(country)
                      ? 'bg-wine-red text-white border-wine-red'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
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
            {/* Selected categories as badges */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedCategories.map(category => (
                  <Badge 
                    key={`selected-${category}`}
                    variant="secondary"
                    className="flex items-center gap-1 bg-amber-500 bg-opacity-10 text-amber-700 hover:bg-amber-500 hover:bg-opacity-20"
                  >
                    {category}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleCategory(category);
                      }}
                      className="ml-1 rounded-full hover:bg-amber-500 hover:bg-opacity-10 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {COMMON_CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`py-1 px-3 rounded-full text-sm border transition-colors ${
                    selectedCategories.includes(category)
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
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
            variant="outline"
            onClick={handleResetFilters}
            className="flex-1 mr-2"
          >
            <RefreshCw size={14} className="mr-2" />
            Reset
          </Button>
        )}
        
        <Button 
          variant="default"
          onClick={handleApplyFilters}
          className={`${activeFilterCount > 0 ? "flex-1" : "w-full"} bg-wine-red hover:bg-wine-red-light`}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}