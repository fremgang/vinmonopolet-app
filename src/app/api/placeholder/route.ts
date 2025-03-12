// src/app/api/placeholder/route.ts
import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const width = parseInt(searchParams.get('width') || '300');
  const height = parseInt(searchParams.get('height') || '400');
  
  // Generate a simple SVG placeholder
  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f8f9fa"/>
  <path d="M${width/2 - 30},${height/2 - 50} a30,30 0 1,0 60,0 a30,30 0 1,0 -60,0" fill="#8c1c13"/>
  <rect x="${width/2 - 15}" y="${height/2}" width="30" height="60" fill="#8c1c13"/>
  <text x="50%" y="85%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">No Image</text>
</svg>
  `;
  
  // Convert SVG to PNG for better compatibility
  try {
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();
    
    return new Response(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  } catch (error) {
    // If sharp fails, return the SVG directly
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  }
}