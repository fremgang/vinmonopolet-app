// 1. Fix missing categories route
// src/app/categories/page.tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const COMMON_CATEGORIES = [
  { name: 'Red Wine', icon: '🍷' },
  { name: 'White Wine', icon: '🥂' },
  { name: 'Rosé Wine', icon: '🌸' },
  { name: 'Sparkling Wine', icon: '✨' },
  { name: 'Dessert Wine', icon: '🍯' },
  { name: 'Fortified Wine', icon: '🏺' },
  { name: 'Whisky', icon: '🥃' },
  { name: 'Vodka', icon: '❄️' },
  { name: 'Gin', icon: '🌿' },
  { name: 'Rum', icon: '🏝️' },
  { name: 'Tequila', icon: '🌵' },
  { name: 'Brandy', icon: '🌰' },
  { name: 'Beer', icon: '🍺' },
  { name: 'Cider', icon: '🍎' }
];

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold mb-6">Product Categories</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {COMMON_CATEGORIES.map((category) => (
          <Link 
            key={category.name}
            href={`/?category=${encodeURIComponent(category.name)}`}
            className="block transition-transform hover:-translate-y-1"
          >
            <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <span className="text-2xl mr-2">{category.icon}</span>
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600">
                  Browse {category.name.toLowerCase()} products
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}