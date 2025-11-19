export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // --- DYNAMIC DATA ---
  const rawData = searchParams.get('data');
  const dynamicHeight = parseInt(searchParams.get('h') || '600');
  
  let elements = [
    { type: 'text', text: "Hi, I'm Developer", x: 700, y: 200, size: 48, color: "#334155", bold: true, align: "middle" },
    { type: 'text', text: "Building things for the web", x: 700, y: 260, size: 24, color: "#64748b", bold: false, align: "middle" }
  ];

  try {
    if (rawData) {
      elements = JSON.parse(rawData);
    }
  } catch (e) {
    console.error("Failed to parse data");
  }

  const style = searchParams.get('style') || 'ethereal';
  const theme = searchParams.get('theme') || 'blue';
  const blobCount = parseInt(searchParams.get('blobs') || '5') || 5;
  const customFrom = searchParams.get('from');
  const customTo = searchParams.get('to');

  const themes: any = {
    blue: { from: '#2563eb', to: '#06b6d4', text: '#ffffff', bg: '#0f172a' },
    purple: { from: '#7c3aed', to: '#db2777', text: '#ffffff', bg: '#2e1065' },
    green: { from: '#059669', to: '#84cc16', text: '#ffffff', bg: '#064e3b' },
    orange: { from: '#ea580c', to: '#f59e0b', text: '#ffffff', bg: '#431407' },
    custom: { from: customFrom || '#6366f1', to: customTo || '#ec4899', text: '#ffffff', bg: '#0f172a' }
  };
  const t = themes[theme] || themes.blue;

  const width = 1400;
  const height = dynamicHeight;

  // --- ELEMENT RENDERING ---
  // We use Promise.all to fetch images in parallel if there are any markers
  const renderedElements = await Promise.all(elements.map(async (el: any) => {
    
    // >> TEXT RENDERER
    if (el.type === 'text' || !el.type) {
      const fontWeight = el.bold ? 'bold' : 'normal';
      const textDecoration = el.underline ? 'underline' : 'none';
      const safeText = (el.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      return `
        <text 
          x="${el.x}" y="${el.y}" 
          text-anchor="${el.align || 'start'}" 
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
          font-size="${el.size}" 
          font-weight="${fontWeight}" 
          fill="${el.color}"
          text-decoration="${textDecoration}"
          style="text-decoration: ${textDecoration}"
        >
          ${safeText}
        </text>
      `;
    }

    // >> IMAGE/MARKER RENDERER
    if (el.type === 'image') {
      try {
        // We MUST fetch and embed base64 for GitHub to show it
        const imgRes = await fetch(el.src);
        if (!imgRes.ok) return ''; // Skip failed images
        
        const arrayBuffer = await imgRes.arrayBuffer();
        // Convert to Base64 in Edge Runtime
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        const contentType = imgRes.headers.get('content-type') || 'image/png';
        const dataUri = `data:${contentType};base64,${base64}`;

        // Center the image on its X/Y coordinates to behave like text anchor="middle"
        // If user aligns 'start', we don't offset. If 'middle', we offset by width/2.
        let xOffset = 0;
        let yOffset = 0;
        
        // Default behavior in our editor is center-pivot, so we adjust:
        xOffset = -(el.width / 2);
        yOffset = -(el.height / 2);

        return `
          <image 
            href="${dataUri}" 
            x="${el.x + xOffset}" 
            y="${el.y + yOffset}" 
            width="${el.width}" 
            height="${el.height}" 
          />
        `;
      } catch (error) {
        console.error("Error fetching image:", error);
        return ''; 
      }
    }
    return '';
  }));

  const contentSvg = renderedElements.join('');

  // --- BACKGROUND LOGIC ---
  let backgroundSvg = '';
  if (style === 'ethereal') {
    const padding = 250;
    const minX = padding;
    const maxX = width - padding;
    const minY = padding;
    const maxY = height - padding;
    const segmentWidth = (maxX - minX) / blobCount;

    const blobCode = Array.from({ length: blobCount }).map((_, i) => {
      const r1 = ((i + 1) * 137.508) % 1;
      const r2 = ((i + 1) * 211.31) % 1;
      const r3 = ((i + 1) * 73.19) % 1;
      const startX = minX + (i * segmentWidth) + (r1 * segmentWidth * 0.5);
      const startY = minY + (r2 * (maxY - minY));
      let driftX = (r3 > 0.5 ? 1 : -1) * (150 + (r1 * 150));
      let driftY = (r2 - 0.5) * 200;
      
      if (startX + driftX > maxX) driftX = -Math.abs(driftX);
      if (startX + driftX < minX) driftX = Math.abs(driftX);
      if (startY + driftY > maxY) driftY = -Math.abs(driftY);
      if (startY + driftY < minY) driftY = Math.abs(driftY);

      const midX = startX + driftX;
      const midY = startY + driftY;
      const r = 60 + (r2 * 40);
      const dur = 20 + (r1 * 10);
      const fill = i % 2 === 0 ? 'url(#blob1)' : 'url(#blob2)';
      return `<circle r="${r}" fill="${fill}"><animate attributeName="cx" values="${startX}; ${midX}; ${startX}" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="${dur}s" repeatCount="indefinite" /><animate attributeName="cy" values="${startY}; ${midY}; ${startY}" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="${dur}s" repeatCount="indefinite" /></circle>`;
    }).join('');

    backgroundSvg = `
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="60" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -7" result="goo" />
        </filter>
        <linearGradient id="blob1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${t.from}" /><stop offset="100%" stop-color="${t.to}" /></linearGradient>
        <linearGradient id="blob2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${t.to}" /><stop offset="100%" stop-color="${t.from}" /></linearGradient>
      </defs>
      <g filter="url(#goo)" opacity="0.8">${blobCode}</g>
    `;
  } else {
    backgroundSvg = `
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${t.from}" /><stop offset="100%" stop-color="${t.to}" /></linearGradient></defs>
      <rect width="${width}" height="${height}" fill="${t.bg}" />
      <circle cx="${width - 200}" cy="100" r="300" fill="url(#grad)" opacity="0.2" />
      <circle cx="100" cy="${height - 100}" r="300" fill="url(#grad)" opacity="0.2" />
    `;
  }

  const svg = `
    <svg width="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${backgroundSvg}
      ${contentSvg}
    </svg>`;

  return new Response(svg, { 
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store, max-age=0' } 
  });
}
