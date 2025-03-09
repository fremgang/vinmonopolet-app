// src/app/api/products/route.ts - Updated with enhanced caching
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Initialize Prisma client with accelerate extension
const prisma = new PrismaClient().$extends(withAccelerate());

// Define valid sort options
const validSortFields = ['product_id', 'name', 'price', 'category', 'country', 'district'];
const validSortOrders = ['asc', 'desc'] as const;
type SortOrder = typeof validSortOrders[number];

// Cache time constants (in seconds)
const CACHE_SHORT = 60 * 5;       // 5 minutes
const CACHE_MEDIUM = 60 * 60;     // 1 hour
const CACHE_LONG = 60 * 60 * 24;  // 24 hours
const CACHE_REVALIDATE = 60 * 30; // 30 minutes

// In-memory cache for quick responses
const responseCache = new Map<string, { data: any, timestamp: number }>();

// Generate cache key from search params
function generateCacheKey(params: URLSearchParams): string {
  return `products-${
    params.get('search') || ''
  }-${
    params.get('sortBy') || 'price'
  }-${
    params.get('sortOrder') || 'desc'
  }-${
    params.get('page') || '1'
  }-${
    params.get('limit') || '50'
  }-${
    params.getAll('countries').join(',')
  }-${
    params.getAll('categories').join(',')
  }-${
    params.get('minPrice') || '0'
  }-${
    params.get('maxPrice') || '100000'
  }`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Generate cache key for this specific request
    const cacheKey = generateCacheKey(searchParams);
    
    // Check for cached response
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse && (Date.now() - cachedResponse.timestamp < CACHE_SHORT * 1000)) {
      // Return cached response if it's still fresh
      console.log(`Cache hit for ${cacheKey}`);
      return NextResponse.json(cachedResponse.data, {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_SHORT}, s-maxage=${CACHE_MEDIUM}, stale-while-revalidate=${CACHE_REVALIDATE}`,
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
        }
      });
    }
    
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
    
    // Search filter - more efficient with OR conditions
    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { producer: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Determine cache TTL based on query complexity
    // More specific queries get longer cache times (less likely to change)
    const cacheTTL = search || countries.length > 0 || categories.length > 0 
      ? CACHE_MEDIUM  // More specific query = medium cache
      : CACHE_SHORT;  // General listing = shorter cache
    
    // Calculate cache settings for Prisma
    const cacheStrategy = {
      ttl: cacheTTL,              // Time to live
      swr: CACHE_REVALIDATE,      // Stale-while-revalidate time
      regions: ['global']         // Cache globally
    };
    
    // Get total count for pagination info
    const totalCount = await prisma.products.count({
      where: whereCondition,
      cacheStrategy
    });
    
    // Execute paginated query with accelerate caching
    const products = await prisma.products.findMany({
      where: whereCondition,
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: offset,
      take: limit,
      cacheStrategy
    });
    
    // Prepare response data
    const responseData = {
      products,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
        hasMore: offset + products.length < totalCount
      }
    };
    
    // Store in memory cache
    responseCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    // Clean up old cache entries occasionally
    if (Math.random() < 0.05) { // 5% chance on each request
      const now = Date.now();
      for (const [key, value] of responseCache.entries()) {
        if (now - value.timestamp > CACHE_MEDIUM * 1000) {
          responseCache.delete(key);
        }
      }
    }
    
    // Return response with appropriate cache headers
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_SHORT}, s-maxage=${CACHE_MEDIUM}, stale-while-revalidate=${CACHE_REVALIDATE}`,
        'X-Cache': 'MISS',
        'X-Cache-Key': cacheKey,
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
  } finally {
    await prisma.$disconnect();
  }
}