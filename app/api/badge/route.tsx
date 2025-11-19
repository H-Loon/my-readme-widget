import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('name') || 'Developer';
  const tagline = searchParams.get('tagline') || 'Building cool things';
  const style = searchParams.get('style') || 'ethereal';
  const theme = searchParams.get('theme') || 'blue';
  const blobCount = parseInt(searchParams.get('blobs') || '5');
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

  // ==========================================
  // RENDERER: ETHEREAL (Liquid Animation)
  // ==========================================
  if (style === 'ethereal') {
    const svgWidth = 1400;
    const svgHeight = 600;
    const padding = 100;
    const minX = padding;
    const maxX = svgWidth - padding;
    const minY = padding;
    const maxY = svgHeight - padding;
    const segmentWidth = (maxX - minX) / blobCount;

    const blobCode = Array.from({ length: blobCount }).map((_, i) => {
      const r1 = ((i + 1) * 137.508) % 1;
      const r2 = ((i + 1) * 211.31) % 1;
      const r3 = ((i + 1) * 73.19) % 1;

      const startX = minX + (i * segmentWidth) + (r1 * segmentWidth * 0.5);
      const startY = minY + (r2 * (maxY - minY));

      let driftX = (r3 > 0.5 ? 1 : -1) * (150 + (r1 * 150));
      if (startX + driftX > svgWidth - 50) driftX = -200;
      if (startX + driftX < 50) driftX = 200;

      const driftY = (r2 - 0.5) * 200;
      const midX = startX + driftX;
      const midY = startY + driftY;
      const r = 70 + (r2 * 50);
      const dur = 20 + (r1 * 10);
      const fill = i % 2 === 0 ? 'url(#blob1)' : 'url(#blob2)';

      return `<circle r="${r}" fill="${fill}"><animate attributeName="cx" values="${startX}; ${midX}; ${startX}" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="${dur}s" repeatCount="indefinite" /><animate attributeName="cy" values="${startY}; ${midY}; ${startY}" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="${dur}s" repeatCount="indefinite" /></circle>`;
    }).join('');

    const svg = `
      <svg width="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="60" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -7" result="goo" />
          </filter>
          <linearGradient id="blob1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${t.from}" />
            <stop offset="100%" stop-color="${t.to}" />
          </linearGradient>
          <linearGradient id="blob2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${t.to}" />
            <stop offset="100%" stop-color="${t.from}" />
          </linearGradient>
        </defs>
        <g filter="url(#goo)" opacity="0.8">${blobCode}</g>
        <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
          <text x="${svgWidth / 2}" y="200" text-anchor="middle" font-size="48" font-weight="bold" fill="#334155">Hi, I'm ${username}</text>
          <text x="${svgWidth / 2}" y="260" text-anchor="middle" font-size="24" fill="#64748b">${tagline}</text>
          <text x="${svgWidth / 2}" y="340" text-anchor="middle" font-size="18" fill="#475569" opacity="0.8">I am a full-stack developer passionate about building</text>
          <text x="${svgWidth / 2}" y="375" text-anchor="middle" font-size="18" fill="#475569" opacity="0.8">accessible and performant web applications.</text>
          <rect x="${(svgWidth / 2) - 75}" y="420" width="150" height="42" rx="21" fill="#1e293b" />
          <text x="${svgWidth / 2}" y="447" text-anchor="middle" font-size="16" font-weight="600" fill="white">View Portfolio</text>
        </g>
      </svg>`;

    return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store, max-age=0' } });
  }

  // ==========================================
  // RENDERER: SPLIT (Animated Ball)
  // ==========================================
  if (style === 'split') {
    const svg = `
      <svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="${t.from}" /><stop offset="100%" stop-color="${t.to}" /></linearGradient>
          <filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="black" flood-opacity="0.3" /></filter>
        </defs>
        <rect x="50" y="0" width="700" height="150" fill="${t.bg}" rx="15" filter="url(#shadow)" />
        <text x="100" y="60" font-family="sans-serif" font-size="20" fill="${t.text}" opacity="0.7">Hi, I'm</text>
        <text x="100" y="110" font-family="sans-serif" font-weight="900" font-size="50" fill="url(#grad)">${username}</text>
        <rect x="50" y="350" width="700" height="150" fill="${t.bg}" rx="15" filter="url(#shadow)" />
        <text x="100" y="420" font-family="sans-serif" font-size="20" fill="${t.text}" opacity="0.7">Current Status:</text>
        <text x="100" y="460" font-family="sans-serif" font-size="30" fill="${t.text}">${tagline}</text>
        <circle cx="650" r="15" fill="url(#grad)">
          <animate attributeName="cy" values="80; 425; 425; 80" keyTimes="0; 0.4; 0.6; 1" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0 0 1 1; 0.4 0 0.2 1" />
          <animate attributeName="opacity" values="1; 1; 0; 0; 1" keyTimes="0; 0.38; 0.4; 0.95; 1" dur="3s" repeatCount="indefinite" />
          <animate attributeName="r" values="15; 15; 30; 15" keyTimes="0; 0.35; 0.45; 1" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>`;
    return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store, max-age=0' } });
  }

  // ==========================================
  // RENDERER: MODERN (Static Vercel OG)
  // ==========================================
  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg, fontFamily: 'sans-serif', color: t.text, position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', borderRadius: '50%', background: `linear-gradient(to right, ${t.from}, ${t.to})`, opacity: 0.2 }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: `linear-gradient(to right, ${t.from}, ${t.to})`, opacity: 0.2 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <div style={{ fontSize: 24, fontWeight: 600, opacity: 0.8, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 }}>Welcome to my profile</div>
          <div style={{ fontSize: 80, fontWeight: 900, background: `linear-gradient(to right, ${t.from}, ${t.to})`, backgroundClip: 'text', color: 'transparent', marginBottom: 20 }}>{username}</div>
          <div style={{ width: 100, height: 6, background: `linear-gradient(to right, ${t.from}, ${t.to})`, borderRadius: 4, marginBottom: 30 }} />
          <div style={{ fontSize: 32, opacity: 0.9, textAlign: 'center', maxWidth: '80%' }}>{tagline}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
