// src/app/api/image/route.ts
// Simple image proxy with minimal processing

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  // Validate URL
  if (!url) {
    return new Response('URL parameter required', { status: 400 });
  }
  
  // Only allow vinmonopolet.no images
  if (!url.startsWith('https://bilder.vinmonopolet.no/')) {
    return new Response('Only vinmonopolet.no images are allowed', { status: 400 });
  }
  
  try {
    // Simple fetch and forward
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      return new Response('Image not found', { status: 404 });
    }
    
    // Get content type and data
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    const data = await response.arrayBuffer();
    
    // Return with caching headers
    return new Response(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000' // 1 year
      }
    });
  } catch (error) {
    console.error('Error forwarding image:', error);
    return new Response('Failed to fetch image', { status: 500 });
  }
}
