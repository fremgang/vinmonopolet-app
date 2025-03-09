// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define valid sort options
const validSortFields = ['product_id', 'name', 'price', 'category', 'country', 'district'];
const validSortOrders = ['asc', 'desc'] as const;
type SortOrder = typeof validSortOrders[number];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const search = searchParams.get('search')?.toLowerCase() || '';
    const sortBy = validSortFields.includes(searchParams.get('sortBy') || '') 
      ? searchParams.get('sortBy') || 'price'
      : 'price';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as SortOrder;
    
    // Pagination parameters
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    
    // Filter parameters
    const countries = searchParams.getAll('countries');
    const categories = searchParams.getAll('categories');
    const minPrice = parseInt(searchParams.get('minPrice') || '0');
    const maxPrice = parseInt(searchParams.get('maxPrice') || '100000');
    
    // Build query conditions
    let whereCondition: any = {};
    
    // Price filter
    whereCondition.price = {
      gte: minPrice,
      lte: maxPrice,
      not: null,
    };
    
    // Country filter
    if (countries.length > 0) {
      whereCondition.country = { in: countries };
    }
    
    // Category filter
    if (categories.length > 0) {
      whereCondition.category = { in: categories };
    }
    
    // Search filter
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
    
    // Get total count for pagination info - use caching for this query
    const totalCount = await prisma.products.count({
      where: whereCondition,
      cacheStrategy: { ttl: 60 } // Cache for 60 seconds
    });
    
    // Execute paginated query - use caching for product data
    const products = await prisma.products.findMany({
      where: whereCondition,
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: offset,
      take: limit,
      cacheStrategy: { ttl: 30 } // Cache for 30 seconds
    });
    
    // Return response with pagination metadata
    return NextResponse.json({
      products,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
        hasMore: offset + products.length < totalCount
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('API error:', error);
    
    if (error instanceof Error) {
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      
      if (error.message.includes('database connection') || 
          error.message.includes('timed out')) {
        return NextResponse.json(
          { error: 'Database Connection Error', details: error.message },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}