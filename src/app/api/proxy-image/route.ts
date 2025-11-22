/**
 * Image Proxy API Route
 * 
 * This route is a helper utility to fetch images from external URLs and serve them
 * from our own domain. This is often necessary to avoid CORS (Cross-Origin Resource Sharing)
 * issues when trying to manipulate images in the browser (e.g., for the canvas editor).
 * 
 * How it works:
 * 1. Client requests /api/proxy-image?url=https://example.com/image.png
 * 2. Server fetches the image from https://example.com/image.png
 * 3. Server returns the image data to the client with CORS headers allowing access.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * The GET handler for the proxy route.
 * @param request The incoming HTTP request.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    // Fetch the external image
    // We set a User-Agent to look like a browser, as some servers block unknown agents.
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ReadmeWidget/1.0)'
        }
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, { status: response.status });
    }

    // Get the content type (e.g., image/png)
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Read the image data as a buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return the image with permissive CORS headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*', // Allow any domain to access this response
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
