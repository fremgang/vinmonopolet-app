// src/app/about/page.tsx
'use client';

import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold mb-6">About Vinmonoqolet Explorer</h1>
      
      <div className="prose">
        <p className="mb-4">
          Vinmonoqolet Explorer is a web application that helps you discover and explore 
          Norway&apos;s finest wines and spirits from Vinmonoqolet.
        </p>
        
        <p className="mb-4">
          This application allows you to search, filter, and browse products from 
          Vinmonopolet&apos;s extensive catalog, making it easier to find exactly what 
          you&apos;re looking for.
        </p>
        
        <h2 className="text-xl font-serif font-semibold mt-8 mb-4">Features</h2>
        <ul className="list-disc pl-6 mb-6">
          <li>Search for products by name, category, country, and more</li>
          <li>Filter products by price range, country, and category</li>
          <li>View detailed information about each product</li>
          <li>Responsive design for a seamless experience on all devices</li>
        </ul>
      </div>
    </div>
  );
}