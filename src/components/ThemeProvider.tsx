'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { GeistProvider, CssBaseline } from '@geist-ui/core';
import { Moon, Sun } from 'lucide-react';

// Create a theme context
type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

// Custom hook for using theme
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Effect to initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(initialDark);
    document.documentElement.classList.toggle('dark', initialDark);
    setMounted(true);
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDark(prev => {
      const newDark = !prev;
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newDark);
      return newDark;
    });
  };

  // Only render content after mounted to avoid hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <GeistProvider themeType={isDark ? 'dark' : 'light'}>
        <CssBaseline />
        {children}
      </GeistProvider>
    </ThemeContext.Provider>
  );
}

// Theme toggle button component
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span className="hidden sm:inline">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}