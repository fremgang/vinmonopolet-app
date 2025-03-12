// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract parameters with validation
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;
    
    const sortBy = ['name', 'price', 'country', 'category'].includes(searchParams.get('sortBy') || '')
      ? searchParams.get('sortBy') || 'name'
      : 'name';
      
    const sortOrder = ['asc', 'desc'].includes(searchParams.get('sortOrder') || '')
      ? searchParams.get('sortOrder') || 'asc'
      : 'asc';
    
    const search = searchParams.get('search') || '';
    const random = searchParams.get('random') === 'true';
    const priceNotNull = searchParams.get('priceNotNull') === 'true';
    
    console.log(`API request - search: "${search}", page: ${page}, sort: ${sortBy} ${sortOrder}, priceNotNull: ${priceNotNull}`);
    
    // Build where clause
    const where: Prisma.productsWhereInput = {};
    
    // Filter out null prices if sorting by price or if explicitly requested
    if (sortBy === 'price' || priceNotNull) {
      where.price = { not: null };
    }
    
    // Add search filtering
    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { producer: { contains: search, mode: 'insensitive' } }
      ];
      console.log(`Searching with term: "${search}"`);
    }
    
    // Execute query with proper error handling
    let products: any[] = [];
    let totalCount = 0;
    
    try {
      if (random && !search && sortBy !== 'price') {
        // For random results without search, use a simpler query
        products = await prisma.products.findMany({
          take: limit,
          select: {
            product_id: true,
            name: true,
            category: true,
            country: true,
            price: true,
            district: true,
            producer: true,
            lukt: true,
            smak: true,
            imageSmall: true,
            imageMain: true
          },
          orderBy: {
            name: 'asc' // Use name ordering as base before shuffling
          }
        });
        
        // Shuffle in memory
        products = products.sort(() => Math.random() - 0.5);
        totalCount = await prisma.products.count();
      } else {
        // Regular search or paged results
        [products, totalCount] = await Promise.all([
          prisma.products.findMany({
            where,
            take: limit,
            skip,
            orderBy: {
              [sortBy]: sortOrder.toLowerCase()
            },
            select: {
              product_id: true,
              name: true,
              category: true,
              country: true,
              price: true,
              district: true,
              producer: true,
              lukt: true,
              smak: true,
              imageSmall: true,
              imageMain: true
            }
          }),
          prisma.products.count({ where })
        ]);
      }
      
      console.log(`Query returned ${products.length} products out of ${totalCount} total`);
    } catch (dbError) {
      console.error('Database query error:', dbError);
      
      // Return a more friendly response
      return NextResponse.json({
        products: [],
        pagination: { total: 0, page, limit, pages: 0, hasMore: false },
        error: 'Database query failed',
        message: 'The query took too long to process. Try a more specific search.'
      });
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    
    // Add cache headers
    const headers = new Headers();
    
    // Use shorter cache time for search results
    if (search) {
      headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    } else {
      headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    }
    
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
    console.error('Error handling request:', error);
    
    return NextResponse.json({
      products: [],
      pagination: { total: 0, page: 1, limit: 20, pages: 0, hasMore: false },
      error: 'Something went wrong'
    });
  }
}
