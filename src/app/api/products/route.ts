// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Add TypeScript declaration for global prisma
declare global {
  var prisma: PrismaClient | undefined;
}

// Database connection pooling for serverless environment with Neon
// This pattern works well with Neon's serverless PostgreSQL
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
    // Recommended datasource configuration for Neon
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} else {
  // Use a global variable in development to prevent multiple connections
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.prisma;
}

// Define product interface
export interface Product {
  product_id: string;
  name: string;
  category: string | null;
  country: string | null;
  price: number | null;
  district: string | null;
  sub_district: string | null;
  producer: string | null;
  varetype: string | null;
  lukt: string | null;
  smak: string | null;
  farge: string | null;
  metode: string | null;
  inneholder: string | null;
  emballasjetype: string | null;
  korktype: string | null;
  utvalg: string | null;
  grossist: string | null;
  transportor: string | null;
  imageSmall: string | null;
  imageMain: string | null;
}

// Define valid sort and filter options
const validSortFields = ['product_id', 'name', 'price', 'category', 'country', 'district'];
const validSortOrders = ['asc', 'desc'] as const;

type SortOrder = typeof validSortOrders[number];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract and validate query parameters
    const search = searchParams.get('search')?.toLowerCase() || '';
    const sortBy = validSortFields.includes(searchParams.get('sortBy') || '') 
      ? searchParams.get('sortBy') || 'price'
      : 'price';
    
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as SortOrder;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Cap at 100
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get filter parameters
    const countries = searchParams.getAll('countries');
    const categories = searchParams.getAll('categories');
    const minPrice = parseInt(searchParams.get('minPrice') || '0');
    const maxPrice = parseInt(searchParams.get('maxPrice') || '10000');
    
    // Build where conditions
    let whereCondition: any = {};
    
    // Basic price filter - always use this
    whereCondition.price = {
      gte: minPrice,
      lte: maxPrice,
      not: null, // Don't include products without a price
    };
    
    // Country filter
    if (countries.length > 0) {
      whereCondition.country = {
        in: countries,
      };
    }
    
    // Category filter
    if (categories.length > 0) {
      whereCondition.category = {
        in: categories,
      };
    }
    
    // Search filter - use a simpler approach with OR conditions
    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { producer: { contains: search, mode: 'insensitive' } },
        { sub_district: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Execute query
    const products = await prisma.products.findMany({
      where: whereCondition,
      orderBy: {
        [sortBy]: sortOrder
      },
      take: limit,
      skip: offset
    });
    
    // Return response with cache headers
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Internal Server Error', details: errorMessage },
      { status: 500 }
    );
  }
}