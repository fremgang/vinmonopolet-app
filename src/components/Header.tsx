// src/components/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, Wine, ShoppingBag, Search } from 'lucide-react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <header className="fixed w-full z-50 shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and site name */}
          <div className="flex items-center space-x-3">
            <Wine size={24} className="text-white" />
            <Link href="/" className="font-serif text-2xl font-bold text-white tracking-tight">
              Vinmonopolet Explorer
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-6">
              <Link href="/" className="text-white hover:text-white/90 transition-colors cursor-pointer font-medium">
                Home
              </Link>
              <Link href="/about" className="text-white hover:text-white/90 transition-colors cursor-pointer font-medium">
                About
              </Link>
              <Link href="/contact" className="text-white hover:text-white/90 transition-colors cursor-pointer font-medium">
                Contact
              </Link>
            </nav>
            
            {/* Quick search icon */}
            <Button 
  size="sm" // Use sm size instead of auto
  onClick={() => setMenuOpen(!menuOpen)}
  variant="ghost" // Use ghost variant instead of abort type
  className="text-white"
>
  <Menu size={22} />
</Button>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <Button 
              onClick={() => setMenuOpen(!menuOpen)}
              type="reset"
              className="text-white"
            >
              <Menu size={22} />
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 animate-fade-in border-t border-white/20">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="block text-white hover:text-white/90 transition-colors cursor-pointer py-2">
                Home
              </Link>
              <Link href="/about" className="block text-white hover:text-white/90 transition-colors cursor-pointer py-2">
                About
              </Link>
              <Link href="/contact" className="block text-white hover:text-white/90 transition-colors cursor-pointer py-2">
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}