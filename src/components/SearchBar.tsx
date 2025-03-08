// src/components/SearchBar.tsx
import { useState, useEffect, useRef } from 'react';
import { Search, X, Mic } from 'lucide-react';

interface SearchBarProps {
  initialValue: string;
  onSearch: (value: string) => void;
  className?: string;
}

export default function SearchBar({ 
  initialValue, 
  onSearch, 
  className = '' 
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches', e);
      }
    }
  }, []);
  
  // Save search term to recent searches
  const saveToRecent = (term: string) => {
    if (!term.trim()) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Handle search submit
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const trimmed = searchTerm.trim();
    if (trimmed) {
      onSearch(trimmed);
      saveToRecent(trimmed);
    }
    
    setShowRecent(false);
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      setShowRecent(true);
    } else {
      setShowRecent(false);
    }
  };
  
  // Handle clearing search
  const handleClear = () => {
    setSearchTerm('');
    setShowRecent(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle focus and blur
  const handleFocus = () => {
    setFocused(true);
    if (searchTerm === '') {
      setShowRecent(true);
    }
  };
  
  const handleBlur = () => {
    // Delay hiding recent searches to allow clicking them
    setTimeout(() => {
      setFocused(false);
      setShowRecent(false);
    }, 200);
  };
  
  // Select a recent search
  const selectRecent = (term: string) => {
    setSearchTerm(term);
    onSearch(term);
    setShowRecent(false);
  };
  
  return (
    <div className={`relative ${className}`}>
      <form 
        onSubmit={handleSubmit}
        className={`
          flex items-center w-full bg-white dark:bg-gray-800 
          rounded-full overflow-hidden shadow-sm transition-shadow duration-300
          ${focused ? 'shadow-md ring-1 ring-burgundy-300 dark:ring-burgundy-700' : ''}
        `}
      >
        <div className="pl-4 text-gray-400">
          <Search size={18} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search wines and spirits..."
          className="
            w-full py-3 px-3 text-gray-700 dark:text-gray-200
            bg-transparent border-none focus:outline-none
          "
        />
        
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={18} />
          </button>
        )}
        
        <button
          type="button"
          className="p-3 border-l border-gray-200 dark:border-gray-700 
                   text-gray-500 hover:text-burgundy-600 dark:hover:text-burgundy-400"
        >
          <Mic size={18} />
        </button>
      </form>
      
      {/* Recent searches dropdown */}
      {showRecent && recentSearches.length > 0 && (
        <div className="
          absolute top-full left-0 right-0 mt-1 
          bg-white dark:bg-gray-800 shadow-lg rounded-md 
          z-10 py-2 border border-gray-200 dark:border-gray-700
        ">
          <div className="px-3 py-1 text-xs text-gray-500 uppercase font-medium">
            Recent Searches
          </div>
          {recentSearches.map((term, index) => (
            <button
              key={index}
              className="
                w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700
                text-gray-700 dark:text-gray-300 flex items-center
              "
              onClick={() => selectRecent(term)}
            >
              <Search size={14} className="mr-2 text-gray-400" />
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}