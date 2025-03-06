import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    console.log('API route called:', request.url);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const country = searchParams.get('country') || '';
    const priceMin = searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')!) : null;
    const priceMax = searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')!) : null;

    console.log('Query params:', { search, category, country, priceMin, priceMax });

    const products = await prisma.products.findMany({
      where: {
        AND: [
          search ? { name: { contains: search } } : {},
          category ? { category: { contains: category } } : {},
          country ? { country: { contains: country } } : {},
          priceMin !== null ? { price: { gte: priceMin } } : {},
          priceMax !== null ? { price: { lte: priceMax } } : {},
        ],
      },
      take: 50,
    });

    console.log('Fetched products:', products.length);
    return NextResponse.json(products);
  } catch (error) {
    console.error('API error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}