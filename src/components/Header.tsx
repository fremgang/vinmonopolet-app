'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@geist-ui/core';
import { Menu } from 'lucide-react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <header className="fixed w-full bg-[#8B1A1A] z-50 shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex-shrink-0">
            <Link href="/" className="font-serif text-2xl font-bold text-white cursor-pointer">
              Vinmonopolet Explorer
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-8">
              <Link href="/" className="text-white hover:text-gray-200 transition-colors cursor-pointer font-medium">
                Home
              </Link>
              <Link href="/about" className="text-white hover:text-gray-200 transition-colors cursor-pointer font-medium">
                About
              </Link>
              <Link href="/contact" className="text-white hover:text-gray-200 transition-colors cursor-pointer font-medium">
                Contact
              </Link>
            </nav>
          </div>

          <div className="md:hidden">
            <Button 
              auto 
              icon={<Menu />} 
              onClick={() => setMenuOpen(!menuOpen)}
              type="abort"
              className="ml-2 text-white"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              placeholder={undefined}
            />
          </div>
        </div>
        
        {menuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="block text-white hover:text-gray-200 transition-colors cursor-pointer">
                Home
              </Link>
              <Link href="/about" className="block text-white hover:text-gray-200 transition-colors cursor-pointer">
                About
              </Link>
              <Link href="/contact" className="block text-white hover:text-gray-200 transition-colors cursor-pointer">
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}