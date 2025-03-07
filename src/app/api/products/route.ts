import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Product {
  product_id: string;
  name: string;
  category: string | null; // Region
  country: string | null;
  price: number | null;
  district: string | null; // District
  sub_district: string | null; // Sub-district
  producer: string | null; // Producer
  varetype: string | null; // Type
  lukt: string | null; // lukt
  smak: string | null; // Taste
  farge: string | null; // Color
  metode: string | null; // Method
  inneholder: string | null; // Contains
  emballasjetype: string | null; // Packaging type
  korktype: string | null; // Cork type
  utvalg: string | null; // Selection
  grossist: string | null; // Wholesaler
  transportor: string | null; // Transporter
  imageSmall: string;
  imageMain: string;
}

const fieldMapping: { [key: string]: string } = {
  taste: 'smak',
  // Add other mappings if needed
};

export async function GET(request: Request) {
  try {
    console.log('Fetching products with params:', request.url);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const sortBy = searchParams.get('sortBy') || 'price';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const validSortFields = ['product_id', 'name', 'price', 'category', 'country', 'district'];
    const validSortOrder = ['asc', 'desc'];
    const orderByField = validSortFields.includes(sortBy) ? fieldMapping[sortBy] || sortBy : 'price';
    const orderByDirection = validSortOrder.includes(sortOrder) ? sortOrder : 'desc';

    const query = `
      SELECT product_id, name, category, country, price, district, sub_district, producer, varetype, lukt, smak, farge, metode, inneholder, emballasjetype, korktype, utvalg, grossist, transportor, imageSmall, imageMain
      FROM products
      WHERE 1=1
      ${search ? `AND (LOWER(district) LIKE ? OR LOWER(name) LIKE ?)` : ''} -- Search district instead of category
      ${sortBy === 'price' ? 'AND price IS NOT NULL' : ''}
      ORDER BY ${orderByField} ${orderByDirection}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const params = search ? [`%${search}%`, `%${search}%`] : [];
    console.log('Executing query:', query, 'with params:', params);
    const products = (await prisma.$queryRawUnsafe(query, ...params)) as Product[];

    console.log('Raw products fetched:', products.length);

    const productsWithImages = products.map((product: Product) => ({
      ...product,
      imageSmall: product.imageSmall || `https://bilder.vinmonopolet.no/cache/300x300-0/${product.product_id}-1.jpg`,
      imageMain: product.imageMain || `https://bilder.vinmonopolet.no/cache/515x515-0/${product.product_id}-1.jpg`,
    }));

    console.log('Products with images:', productsWithImages);
    return NextResponse.json(productsWithImages);
  } catch (error) {
    console.error('API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}