export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('name') || 'Developer';
  const tagline = searchParams.get('tagline') || 'Building cool things';
  const style = searchParams.get('style') || 'ethereal';
  const theme = searchParams.get('theme') || 'blue';
  const blobCount = parseInt(searchParams.get('blobs') || '5') || 5;
  const customFrom = searchParams.get('from');
  const customTo = searchParams.get('to');

  // --- THEME CONFIG ---
  const themes: any = {
    blue: { from: '#2563eb', to: '#06b6d4', text: '#ffffff', bg: '#0f172a' },
    purple: { from: '#7c3aed', to: '#db2777', text: '#ffffff', bg: '#2e1065' },
    green: { from: '#059669', to: '#84cc16', text: '#ffffff', bg: '#064e3b' },
    orange: { from: '#ea580c', to: '#f59e0b', text: '#ffffff', bg: '#431407' },
    custom: { from: customFrom || '#6366f1', to: customTo || '#ec4899', text: '#ffffff', bg: '#0f172a' }
  };
  const t = themes[theme] || themes.blue;

  // --- CANVAS DIMENSIONS ---
  const width = 1400;
  const height = 600;

  // --- GENERATE BLOBS (Only for Ethereal) ---
  let contentSvg = '';
  
  if (style === 'ethereal') {
    // Padding increased to 250 to strictly contain the blurred edges
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

      // Start Position
      const startX = minX + (i * segmentWidth) + (r1 * segmentWidth * 0.5);
      const startY = minY + (r2 * (maxY - minY));

      // Motion Calculation
      let driftX = (r3 > 0.5 ? 1 : -1) * (150 + (r1 * 150));
      let driftY = (r2 - 0.5) * 200;

      // Smart Bounce: If destination is out of bounds, reverse direction
      if (startX + driftX > maxX) driftX = -Math.abs(driftX);
      if (startX + driftX < minX) driftX = Math.abs(driftX);
      
      if (startY + driftY > maxY) driftY = -Math.abs(driftY);
      if (startY + driftY < minY) driftY = Math.abs(driftY);

      const midX = startX + driftX;
      const midY = startY + driftY;
      
      // Slightly reduced radius to help with spacing
      const r = 60 + (r2 * 40);
      const dur = 20 + (r1 * 10);
      const fill = i % 2 === 0 ? 'url(#blob1)' : 'url(#blob2)';

      return `<circle r="${r}" fill="${fill}"><animate attributeName="cx" values="${startX}; ${midX}; ${startX}" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="${dur}s" repeatCount="indefinite" /><animate attributeName="cy" values="${startY}; ${midY}; ${startY}" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="${dur}s" repeatCount="indefinite" /></circle>`;
    }).join('');

    contentSvg = `
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
    // Fallback
    contentSvg = `
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${t.from}" /><stop offset="100%" stop-color="${t.to}" /></linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="${t.bg}" />
      <circle cx="${width - 200}" cy="100" r="300" fill="url(#grad)" opacity="0.2" />
      <circle cx="100" cy="${height - 100}" r="300" fill="url(#grad)" opacity="0.2" />
    `;
  }

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${contentSvg}
      <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
        <text x="${width / 2}" y="200" text-anchor="middle" font-size="48" font-weight="bold" fill="#334155">Hi, I'm ${username}</text>
        <text x="${width / 2}" y="260" text-anchor="middle" font-size="24" fill="#64748b">${tagline}</text>
        <text x="${width / 2}" y="340" text-anchor="middle" font-size="18" fill="#475569" opacity="0.8">I am a full-stack developer passionate about building</text>
        <text x="${width / 2}" y="375" text-anchor="middle" font-size="18" fill="#475569" opacity="0.8">accessible and performant web applications.</text>
        <rect x="${(width / 2) - 75}" y="420" width="150" height="42" rx="21" fill="#1e293b" />
        <text x="${width / 2}" y="447" text-anchor="middle" font-size="16" font-weight="600" fill="white">View Portfolio</text>
      </g>
    </svg>`;

  return new Response(svg, { 
    headers: { 
      'Content-Type': 'image/svg+xml', 
      'Cache-Control': 'no-store, max-age=0' 
    } 
  });
}
