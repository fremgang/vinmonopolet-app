// src/components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, Wine, ShoppingBag, Search, X } from 'lucide-react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Add scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'header-shadow py-2' : 'py-3'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo and site name */}
          <div className="flex items-center space-x-3">
            <Wine size={24} className="text-white" />
            <Link href="/" className="font-serif text-xl md:text-2xl font-bold text-white tracking-tight">
              Vinmonopolet Explorer
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6">
              <Link href="/" className="text-white/90 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-white/90 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/categories" className="text-white/90 hover:text-white transition-colors">
                Categories
              </Link>
            </nav>
            
            <Button 
              variant="ghost"
              size="sm"
              className="text-white border border-white/20 hover:bg-white/10"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} />
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <Button 
              onClick={() => setMenuOpen(!menuOpen)}
              variant="ghost"
              size="icon"
              className="text-white"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 animate-fade-in border-t border-white/20 mt-2">
            <nav className="flex flex-col space-y-1">
              <Link 
                href="/" 
                className="text-white py-2 px-3 rounded-md hover:bg-white/10 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/about" 
                className="text-white py-2 px-3 rounded-md hover:bg-white/10 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/categories" 
                className="text-white py-2 px-3 rounded-md hover:bg-white/10 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Categories
              </Link>
              
              <div className="pt-2 mt-2 border-t border-white/10">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-white border-white/20 hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    setMenuOpen(false);
                    setSearchOpen(true);
                  }}
                >
                  <Search size={16} className="mr-2" />
                  Search Products
                </Button>
              </div>
            </nav>
          </div>
        )}

        {/* Search Modal */}
        {searchOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSearchOpen(false)}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-medium mb-4">Search Products</h3>
              <div className="flex">
                <input 
                  type="text"
                  className="flex-1 p-2 border rounded-l-md focus:outline-none"
                  placeholder="Search for wines, spirits..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      window.location.href = `/?search=${encodeURIComponent((e.target as HTMLInputElement).value)}`;
                      setSearchOpen(false);
                    }
                  }}
                />
                <button 
                  className="bg-wine-red hover:bg-wine-red-light text-white px-4 py-2 rounded-r-md"
                  onClick={(e) => {
                    const input = (e.currentTarget.previousSibling as HTMLInputElement);
                    window.location.href = `/?search=${encodeURIComponent(input.value)}`;
                    setSearchOpen(false);
                  }}
                >
                  <Search size={18} />
                </button>
              </div>
              <div className="mt-4 text-right">
                <Button variant="ghost" size="sm" onClick={() => setSearchOpen(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}