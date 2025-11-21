export const dynamic = 'force-dynamic';

import { WidgetModel } from '@/models/WidgetModel';
import { BadgeSvgView } from '@/views/BadgeSvgView';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  let widgetData: any = {};

  if (id) {
    try {
      const data = await WidgetModel.getById(id);
      if (data) {
        console.log(`Fetching widget ${id}:`, JSON.stringify(data));
        widgetData = {
          elements: data.elements || [],
          width: data.width || 1400,
          height: data.height || 600,
          theme: data.theme || 'blue',
          style: data.style || 'ethereal',
          blobCount: Math.min(50, data.blobCount || 5),
          customFrom: data.customFrom || '',
          customTo: data.customTo || '',
          customBgUrl: data.bgImage || '',
          bgFit: data.bgFit || 'cover'
        };
      }
    } catch (error) {
      console.error("Error fetching from DB:", error);
    }
  }

  // Fallback to query params if no ID or DB fetch failed/empty
  if (!widgetData.elements || widgetData.elements.length === 0) {
    let elements = [];
    const rawData = searchParams.get('data');
    if (rawData) {
      try { elements = JSON.parse(rawData); } catch (e) { }
    } else {
      elements = [
        { type: 'text', text: "Hi, I'm Developer", x: 700, y: 200, size: 48, color: "#334155", bold: true, align: "middle" },
        { type: 'text', text: "Building things for the web", x: 700, y: 260, size: 24, color: "#64748b", bold: false, align: "middle" }
      ];
    }

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
      bgFit: searchParams.get('bgFit') || 'cover'
    };
  }

  const svg = await BadgeSvgView.render(widgetData);

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  });
}