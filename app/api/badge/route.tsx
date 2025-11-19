// app/api/badge/route.tsx
export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('name') || 'Developer';
  const tagline = searchParams.get('tagline') || 'Building cool things';
  
  const themeFrom = '#2563eb';
  const themeTo = '#06b6d4';

  const svg = `
    <svg width="100%" viewBox="0 0 1400 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="60" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -7" result="goo" />
        </filter>
        
        <linearGradient id="blob1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${themeFrom}" />
          <stop offset="100%" stop-color="${themeTo}" />
        </linearGradient>
        <linearGradient id="blob2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${themeTo}" />
          <stop offset="100%" stop-color="${themeFrom}" />
        </linearGradient>
      </defs>

      <g filter="url(#goo)" opacity="0.8">
        <circle r="85.50000000000011" fill="url(#blob1)"><animate attributeName="cx" values="143.54285714285797; 343.542857142858; 143.54285714285797" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="25.080000000000098s" repeatCount="indefinite" /><animate attributeName="cy" values="224.0000000000009; 186.00000000000136; 224.0000000000009" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="25.080000000000098s" repeatCount="indefinite" /></circle><circle r="101.00000000000023" fill="url(#blob2)"><animate attributeName="cx" values="272.8000000000017; 120.39999999999878; 272.8000000000017" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="20.160000000000196s" repeatCount="indefinite" /><animate attributeName="cy" values="348.0000000000018; 372.00000000000273; 348.0000000000018" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="20.160000000000196s" repeatCount="indefinite" /></circle><circle r="116.50000000000318" fill="url(#blob1)"><animate attributeName="cx" values="487.7714285714286; 716.3714285714287; 487.7714285714286" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="25.24000000000001s" repeatCount="indefinite" /><animate attributeName="cy" values="472.00000000002547; 558.0000000000382; 472.00000000002547" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="25.24000000000001s" repeatCount="indefinite" /></circle><circle r="82.00000000000045" fill="url(#blob2)"><animate attributeName="cx" values="617.0285714285748; 771.8285714285806; 617.0285714285748" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="20.32000000000039s" repeatCount="indefinite" /><animate attributeName="cy" values="196.00000000000364; 144.00000000000546; 196.00000000000364" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="20.32000000000039s" repeatCount="indefinite" /></circle><circle r="97.49999999999773" fill="url(#blob1)"><animate attributeName="cx" values="832.0000000000066; 1063.0000000000182; 832.0000000000066" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="25.400000000000773s" repeatCount="indefinite" /><animate attributeName="cy" values="319.9999999999818; 329.9999999999727; 319.9999999999818" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="25.400000000000773s" repeatCount="indefinite" /></circle><circle r="113.00000000000637" fill="url(#blob2)"><animate attributeName="cx" values="961.257142857143; 804.0571428571427; 961.257142857143" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="20.480000000000018s" repeatCount="indefinite" /><animate attributeName="cy" values="444.00000000005093; 516.0000000000764; 444.00000000005093" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="20.480000000000018s" repeatCount="indefinite" /></circle><circle r="78.50000000000364" fill="url(#blob1)"><animate attributeName="cx" values="1176.2285714285747; 942.8285714285687; 1176.2285714285747" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="25.5600000000004s" repeatCount="indefinite" /><animate attributeName="cy" values="168.0000000000291; 102.00000000004366; 168.0000000000291" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="25.5600000000004s" repeatCount="indefinite" /></circle>
      </g>

      <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
        <text x="700" y="200" text-anchor="middle" font-size="48" font-weight="bold" fill="#334155">Hi, I'm ${username}</text>
        <text x="700" y="260" text-anchor="middle" font-size="24" fill="#64748b">${tagline}</text>
        
        <text x="700" y="340" text-anchor="middle" font-size="18" fill="#475569" opacity="0.8">I am a full-stack developer passionate about building</text>
        <text x="700" y="375" text-anchor="middle" font-size="18" fill="#475569" opacity="0.8">accessible and performant web applications.</text>
        
        <rect x="625" y="420" width="150" height="42" rx="21" fill="#1e293b" />
        <text x="700" y="447" text-anchor="middle" font-size="16" font-weight="600" fill="white">View Portfolio</text>
      </g>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
