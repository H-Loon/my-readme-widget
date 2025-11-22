/**
 * Badge Generation API Route
 * 
 * This file defines the API endpoint that GitHub (or any browser) calls to get the SVG image.
 * It acts as the "Controller" in our MVC architecture.
 * 
 * How it works:
 * 1. It receives a GET request (e.g., /api/badge?id=123).
 * 2. It looks for an 'id' parameter to fetch saved widget data from Firebase.
 * 3. If no 'id' is found, it falls back to using query parameters (for live previews).
 * 4. It passes the data to the `BadgeSvgView` to generate the SVG string.
 * 5. It returns the SVG with the correct Content-Type header so it displays as an image.
 */

// 'force-dynamic' tells Next.js NOT to cache this route at build time.
// We need it to run every time a request comes in so we get the latest data.
export const dynamic = 'force-dynamic';

import { WidgetModel } from '@/models/WidgetModel';
import { BadgeSvgView } from '@/views/BadgeSvgView';

/**
 * The GET handler for the API route.
 * @param request The incoming HTTP request object.
 */
export async function GET(request: Request) {
  // Parse the URL to get query parameters
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  let widgetData: any = {};

  // Scenario 1: ID provided - Fetch from Database
  if (id) {
    try {
      const data = await WidgetModel.getById(id);
      if (data) {
        console.log(`Fetching widget ${id}:`, JSON.stringify(data));
        // Normalize data from DB to ensure all fields exist
        widgetData = {
          elements: data.elements || [],
          width: data.width || 1400,
          height: data.height || 600,
          theme: data.theme || 'blue',
          style: data.style || 'ethereal',
          blobCount: Math.min(50, data.blobCount || 5), // Cap blobs for performance
          customFrom: data.customFrom || '',
          customTo: data.customTo || '',
          customBgUrl: data.bgImage || '',
          bgFit: data.bgFit || 'cover',
          bgColor: data.bgColor || '',
          bgGradient: data.bgGradient || null
        };
      }
    } catch (error) {
      console.error("Error fetching from DB:", error);
      // If DB fails, we'll fall through to the default/query param logic
    }
  }

  // Scenario 2: No ID or DB fetch failed - Use Query Params or Defaults
  // This is useful for the live preview in the editor where we haven't saved yet,
  // or if someone wants to generate a badge purely via URL parameters.
  if (!widgetData.elements || widgetData.elements.length === 0) {
    let elements = [];
    const rawData = searchParams.get('data');
    
    // Try to parse 'data' param which might contain JSON encoded elements
    if (rawData) {
      try { elements = JSON.parse(rawData); } catch (e) { }
    } else {
      // Absolute fallback defaults if nothing is provided
      elements = [
        { type: 'text', text: "Hi, I'm Developer", x: 700, y: 200, size: 48, color: "#334155", bold: true, align: "middle" },
        { type: 'text', text: "Building things for the web", x: 700, y: 260, size: 24, color: "#64748b", bold: false, align: "middle" }
      ];
    }

    let bgGradient = null;
    try {
      const bgGradientParam = searchParams.get('bgGradient');
      if (bgGradientParam) {
        bgGradient = JSON.parse(bgGradientParam);
      }
    } catch (e) {}

    widgetData = {
      elements,
      width: parseInt(searchParams.get('w') || '1400'),
      height: parseInt(searchParams.get('h') || '600'),
      style: searchParams.get('style') || 'ethereal',
      theme: searchParams.get('theme') || 'blue',
      blobCount: Math.min(50, parseInt(searchParams.get('blobs') || '5')),
      customFrom: searchParams.get('from') || '',
      customTo: searchParams.get('to') || '',
      customBgUrl: searchParams.get('bg') || '',
      bgFit: searchParams.get('bgFit') || 'cover',
      bgColor: searchParams.get('bgColor') || '',
      bgGradient
    };
  }

  // Generate the SVG string using the View
  const svg = await BadgeSvgView.render(widgetData);

  // Return the response with SVG content type
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      // Cache Control:
      // We want GitHub to re-fetch the image frequently so updates appear quickly.
      // 'no-store, no-cache' tells browsers and proxies not to save it.
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  });
}