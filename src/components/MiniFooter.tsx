// src/components/MiniFooter.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { X } from 'lucide-react';

export default function MiniFooter() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 mx-auto max-w-xl z-10">
      <div className="bg-gray-800/90 backdrop-blur-sm text-white rounded-lg shadow-lg mx-4 py-3 px-4">
        <button 
          onClick={() => setIsVisible(false)} 
          className="absolute right-3 top-3 text-gray-400 hover:text-white"
          aria-label="Close footer"
        >
          <X size={16} />
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">
              Vinmonopolet Explorer &copy; {new Date().getFullYear()}
            </p>
          </div>
          
          <div className="flex space-x-4 text-sm">
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}