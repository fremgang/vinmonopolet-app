'use client';

import React, { useState } from 'react';
import { 
  Button, 
  buttonVariants 
} from '@/components/ui/button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Wine, 
  Search, 
  Filter, 
  Grid, 
  List, 
  ArrowRight, 
  Globe, 
  Tag 
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Sample product data
const SAMPLE_PRODUCTS = [
  {
    product_id: '1101',
    name: 'Løiten Linie',
    category: 'Brennevin - Akevitt - Akevitt, brun',
    price: 469,
    country: 'Norge',
    district: 'Akershus',
    producer: 'Arcus',
    lukt: 'Aroma med tydelig preg av karve og anis, innslag av fat, vanilje og tørket appelsinskall.',
    smak: 'Karvepreget og sammensatt med god fylde, innslag av anis, sitrus, fat og vanilje. God lengde.',
    utvalg: 'Basisutvalget',
    imageSmall: '',
    imageMain: ''
  },
  {
    product_id: '1201',
    name: 'Gilde Non Plus Ultra',
    category: 'Brennevin - Akevitt - Akevitt, brun',
    price: 634,
    country: 'Norge',
    district: null,
    producer: 'Arcus',
    lukt: 'Aroma med fint preg av karve, sitrus og blomst over innslag av fat.',
    smak: 'Fint preg av karve, sitrus og integrert fat. God fylde og lengde.',
    utvalg: 'Bestillingsutvalget',
    imageSmall: '',
    imageMain: ''
  },
  {
    product_id: '1301',
    name: 'Aalborg Taffel Akvavit',
    category: 'Brennevin - Akevitt - Akevitt, blank',
    price: 409,
    country: 'Danmark',
    district: null,
    producer: 'Arcus Denmark, Danske Spritfabr.',
    lukt: 'Tydelig og fokusert aroma av karve, streif av sitrusaktige toner, anis og dill.',
    smak: 'Karvepreget med god fylde og lengde, undertoner av appelsin, litt lakris, dill og fennikel.',
    utvalg: 'Basisutvalget',
    imageSmall: '',
    imageMain: ''
  }
];

export default function ShadcnExamplePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortValue, setSortValue] = useState('price:desc');
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">Shadcn UI Examples</h1>
        <p className="text-gray-600 mb-4">This page demonstrates Shadcn UI components in the Vinmonopolet Explorer</p>
        
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "mr-4"
            )}
          >
            Return to Home
          </Link>
          
          <div className="text-gray-400">|</div>
          
          <Link 
            href="https://ui.shadcn.com/docs" 
            target="_blank"
            className="text-[var(--wine-red)] hover:underline flex items-center gap-1"
          >
            Shadcn UI Documentation
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Different button variants from Shadcn UI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="wine">Wine (Custom)</Button>
              <Button variant="default" size="icon">
                <Wine size={18} />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Form Controls</CardTitle>
            <CardDescription>Input and select components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Input</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input type="text" placeholder="Search products..." className="pl-9" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select</label>
              <Select defaultValue="price:desc">
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price:desc">Price: High to Low</SelectItem>
                  <SelectItem value="price:asc">Price: Low to High</SelectItem>
                  <SelectItem value="name:asc">Name: A-Z</SelectItem>
                  <SelectItem value="name:desc">Name: Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Different badge variants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="wine">Wine (Custom)</Badge>
              
              <Badge variant="category" className="flex items-center gap-1">
                <Tag size={12} />
                <span>Category</span>
              </Badge>
              
              <Badge variant="country" className="flex items-center gap-1">
                <Globe size={12} />
                <span>Country</span>
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-semibold mb-4">Sample Products with Shadcn UI</h2>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input type="text" placeholder="Search wines and spirits..." className="pl-9" />
          </div>
          
          <div className="flex gap-2">
            <Select 
              value={sortValue} 
              onValueChange={setSortValue}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price:desc">Price: High to Low</SelectItem>
                <SelectItem value="price:asc">Price: Low to High</SelectItem>
                <SelectItem value="name:asc">Name: A-Z</SelectItem>
                <SelectItem value="name:desc">Name: Z-A</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Filter size={16} className="mr-2" />
              Filter
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
              <span className="ml-2">{viewMode === 'grid' ? 'List' : 'Grid'}</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_PRODUCTS.map(product => (
            <Card 
              key={product.product_id}
              className="cursor-pointer h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2 text-center font-serif">{product.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="p-4 space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {product.category && (
                    <Badge variant="category" className="flex items-center gap-1">
                      <Tag size={12} />
                      <span className="truncate max-w-[120px]">{product.category}</span>
                    </Badge>
                  )}
                  {product.country && (
                    <Badge variant="country" className="flex items-center gap-1">
                      <Globe size={12} />
                      <span>{product.country}</span>
                    </Badge>
                  )}
                  {product.utvalg && (
                    <Badge variant="outline">{product.utvalg}</Badge>
                  )}
                </div>
                
                {/* Aroma Section */}
                {product.lukt && (
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase font-semibold text-[var(--wine-red)]">Aroma</h4>
                    <p className="text-sm text-gray-700 line-clamp-3">{product.lukt}</p>
                  </div>
                )}
                
                {/* Taste Section */}
                {product.smak && (
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase font-semibold text-[var(--wine-red)]">Taste</h4>
                    <p className="text-sm text-gray-700 line-clamp-3">{product.smak}</p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="bg-gray-50 border-t p-4 flex justify-between items-center">
                <div className="text-lg font-bold text-[var(--wine-red)]">
                  {new Intl.NumberFormat('no-NO').format(product.price)} kr
                </div>
                {product.producer && (
                  <div className="text-sm text-gray-600 truncate max-w-[50%]">
                    {product.producer}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="border-t pt-8 mt-8">
        <h2 className="text-2xl font-serif font-semibold mb-4">Implementation Steps</h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li>Install Shadcn UI dependencies including Radix UI primitives</li>
          <li>Create utils.ts file for class name utilities</li>
          <li>Configure Tailwind CSS with Shadcn UI theme variables</li>
          <li>Add components one by one as needed for your application</li>
          <li>Customize component themes to match your wine-themed design</li>
          <li>Replace Geist UI components with Shadcn UI components in your app</li>
        </ol>
        
        <div className="mt-6">
          <Button variant="wine" asChild>
            <Link href="/">
              Return to Main Application
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}