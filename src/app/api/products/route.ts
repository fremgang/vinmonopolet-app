// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    // Extract sorting parameters
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    // Extract search and filter parameters
    const search = searchParams.get('search') || '';
    const minPrice = parseInt(searchParams.get('minPrice') || '0');
    const maxPrice = parseInt(searchParams.get('maxPrice') || '100000');
    const countries = searchParams.getAll('countries');
    const categories = searchParams.getAll('categories');
    
    // Build where clause for filtering
    const where: any = {};
    
    // Add search condition
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { producer: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Add price range condition
    if (minPrice > 0 || maxPrice < 100000) {
      where.price = {
        gte: minPrice,
        lte: maxPrice
      };
    }
    
    // Add country filter
    if (countries.length > 0) {
      where.country = { in: countries };
    }
    
    // Add category filter
    if (categories.length > 0) {
      where.category = { in: categories };
    }
    
    // Execute queries in parallel for better performance
    const [products, totalCount] = await Promise.all([
      prisma.products.findMany({
        where,
        take: limit,
        skip,
        orderBy: {
          [sortBy]: sortOrder.toLowerCase()
        }
      }),
      prisma.products.count({ where })
    ]);
    
    // Calculate pagination information
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    
    // Return response
    return NextResponse.json({
      products,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: totalPages,
        hasMore
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' }, 
      { status: 500 }
    );
  }
}