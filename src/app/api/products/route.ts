import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    
    // Build query with raw SQL for case-insensitive search
    // since Prisma doesn't support 'mode: insensitive' in all providers
    let whereCondition = {};
    
    if (search) {
      whereCondition = {
        OR: [
          { name: { contains: search } },
          { district: { contains: search } },
          { country: { contains: search } },
          { category: { contains: search } },
          { producer: { contains: search } }
        ]
      };
    }
    
    if (sortBy === 'price') {
      whereCondition = {
        ...whereCondition,
        price: { not: null }
      };
    }
    
    const products = await prisma.products.findMany({
      where: whereCondition,
      orderBy: {
        [sortBy]: sortOrder
      },
      take: limit,
      skip: offset
    });

    // Add image URLs to products
    const productsWithImages = products.map(product => ({
      ...product,
      imageSmall: `https://bilder.vinmonopolet.no/cache/300x300-0/${product.product_id}-1.jpg`,
      imageMain: `https://bilder.vinmonopolet.no/cache/515x515-0/${product.product_id}-1.jpg`,
    }));

    return NextResponse.json(productsWithImages);
  } catch (error) {
    console.error('API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Internal Server Error', details: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}