// src/app/api/streams/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

/**
 * Handler for product update stream
 * Creates a Server-Sent Events endpoint for real-time product updates
 */
export async function GET(request: NextRequest) {
  // Extract query parameters for filtering
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const country = searchParams.get('country');
  const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;
  
  // For debugging
  console.log('Stream requested with filters:', { category, country, minPrice, maxPrice });
  
  try {
    // Create a stream response
    const stream = new ReadableStream({
      async start(controller) {
        // Setup keep-alive interval to prevent connection timeouts
        const keepAliveInterval = setInterval(() => {
          try {
            controller.enqueue(new TextEncoder().encode(': keepalive\n\n'));
          } catch (e) {
            // Connection might be closed
            clearInterval(keepAliveInterval);
          }
        }, 30000);
        
        try {
          // Create filter conditions for the stream
          const whereCondition: any = {};
          
          if (category) whereCondition.category = category;
          if (country) whereCondition.country = country;
          if (minPrice !== undefined || maxPrice !== undefined) {
            whereCondition.price = {};
            if (minPrice !== undefined) whereCondition.price.gte = minPrice;
            if (maxPrice !== undefined) whereCondition.price.lte = maxPrice;
          }
          
          // Initialize the Pulse stream
          const productStream = await prisma.products.stream({
            name: 'product-updates',
            where: Object.keys(whereCondition).length > 0 ? whereCondition : undefined
          });
          
          // Stream event handling
          for await (const event of productStream) {
            console.log('Product event received:', event.type);
            
            // Format and send the event
            const data = JSON.stringify(event);
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          
          // Send error to client
          const errorData = JSON.stringify({ 
            type: 'error', 
            message: error instanceof Error ? error.message : 'Unknown stream error' 
          });
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
          
          // Clean up interval and close stream
          clearInterval(keepAliveInterval);
          controller.close();
        }
        
        // Clean up if the stream ends normally
        return () => {
          console.log('Stream closed normally');
          clearInterval(keepAliveInterval);
        };
      },
      
      // Handle cancellation
      cancel() {
        console.log('Stream cancelled by client');
      }
    });
    
    // Return the stream with appropriate headers
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' // Prevents proxy buffering
      },
    });
  } catch (error) {
    console.error('Failed to create stream:', error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
    }
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Failed to create stream',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}