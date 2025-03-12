// src/app/api/products/simple/route.ts - Super simplified version to avoid timeouts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract parameters with validation
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const search = searchParams.get('search') || '';
    
    // Build where clause - keep it minimal
    const where: any = {
      name: { not: null }
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Simplified query - no pagination, no sorting
    const products = await prisma.products.findMany({
      where,
      take: limit
    });
    
    // Add cache headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    return NextResponse.json({
      products,
      pagination: {
        total: products.length,
        page: 1,
        limit,
        pages: 1,
        hasMore: false
      }
    }, { headers });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}