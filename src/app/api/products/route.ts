// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Add timeout to prevent long-running queries
const QUERY_TIMEOUT = 10000; // 10 seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract parameters with validation
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;
    
    const sortBy = ['name', 'price', 'country', 'category'].includes(searchParams.get('sortBy') || '')
      ? searchParams.get('sortBy') || 'name'
      : 'name';
      
    const sortOrder = ['asc', 'desc'].includes(searchParams.get('sortOrder') || '')
      ? searchParams.get('sortOrder') || 'asc'
      : 'asc';
    
    const search = searchParams.get('search') || '';
    const minPrice = Math.max(0, parseInt(searchParams.get('minPrice') || '0'));
    const maxPrice = Math.max(minPrice, parseInt(searchParams.get('maxPrice') || '100000'));
    
    const countries = searchParams.getAll('countries');
    const categories = searchParams.getAll('categories');
    
    // Special parameters
    const random = searchParams.get('random') === 'true';
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      // Improve search to match multiple fields and use case-insensitive search
      where.OR = [
        // Use contains for more flexible matching
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { producer: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        // Add district to search criteria
        { district: { contains: search, mode: 'insensitive' } },
        // Add sub_district to search criteria
        { sub_district: { contains: search, mode: 'insensitive' } },
        // Also search in description fields
        { lukt: { contains: search, mode: 'insensitive' } },
        { smak: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (minPrice > 0 || maxPrice < 100000) {
      where.price = {
        gte: minPrice,
        lte: maxPrice
      };
    }
    
    if (countries.length > 0) {
      where.country = { in: countries };
    }
    
    if (categories.length > 0) {
      where.category = { in: categories };
    }
    
    // Handle price sorting - filter out null prices when sorting by price
    if (sortBy === 'price') {
      where.price = {
        ...where.price,
        not: null // Exclude null prices when sorting by price
      };
    }
    
    // Add timeout promise to prevent long-running queries
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT);
    });
    
    // Execute query with timeout
    let products;
    let totalCount;
    
    if (random) {
      // For random products, we need to use a different approach
      // PostgreSQL-specific random function
      [products, totalCount] = await Promise.race([
        Promise.all([
          prisma.$queryRaw`
            SELECT * FROM "products" 
            WHERE "name" IS NOT NULL
            ORDER BY RANDOM() 
            LIMIT ${limit}
          `,
          prisma.products.count({ where })
        ]),
        timeoutPromise
      ]) as [any[], number];
    } else {
      // Normal sorting
      [products, totalCount] = await Promise.race([
        Promise.all([
          prisma.products.findMany({
            where,
            take: limit,
            skip,
            orderBy: {
              [sortBy]: sortOrder.toLowerCase()
            }
          }),
          prisma.products.count({ where })
        ]),
        timeoutPromise
      ]) as [any[], number];
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    
    // Add cache headers for performance
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
    
    return NextResponse.json({
      products,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: totalPages,
        hasMore
      }
    }, { headers });
  } catch (error) {
    console.error('Error fetching products:', error);
    
    // Determine appropriate error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const status = errorMessage === 'Query timeout' ? 504 : 500;
    
    return NextResponse.json(
      { error: 'Failed to fetch products', message: errorMessage }, 
      { status }
    );
  }
}