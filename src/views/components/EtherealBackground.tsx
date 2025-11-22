/**
 * EtherealBackground.tsx
 * 
 * Renders the "Ethereal" animated background using standard SVG elements.
 * This component is placed behind the Konva canvas to provide high-performance
 * CSS/SVG animations that the Canvas API cannot handle natively.
 * 
 * Updates:
 * - Added fallback logic to ensure blobs are visible even when the theme is 'transparent'.
 */
import React, { useMemo } from 'react';

interface EtherealBackgroundProps {
  width: number;
  height: number;
  theme: string;
  blobCount: number;
  customFrom?: string;
  customTo?: string;
  bgColor?: string;
  bgGradient?: {
    enabled: boolean;
    stops: { offset: number; color: string }[];
  };
}

export const EtherealBackground: React.FC<EtherealBackgroundProps> = ({
  width,
  height,
  theme,
  blobCount,
  customFrom,
  customTo,
  bgColor,
  bgGradient
}) => {
  // Define color themes mapping (legacy support)
  const themes: any = {
    blue: { from: '#2563eb', to: '#06b6d4', bg: '#0f172a' },
    purple: { from: '#7c3aed', to: '#db2777', bg: '#2e1065' },
    green: { from: '#059669', to: '#84cc16', bg: '#064e3b' },
    orange: { from: '#ea580c', to: '#f59e0b', bg: '#431407' },
    transparent: { from: 'transparent', to: 'transparent', bg: 'transparent' },
    custom: { from: customFrom || '#6366f1', to: customTo || '#ec4899', bg: '#0f172a' }
  };
  
  // Determine colors
  let bg = '#0f172a';
  let gradientStops1: React.ReactNode[] = [];
  let gradientStops2: React.ReactNode[] = [];

  // If theme is transparent, force it to blue for Ethereal mode to ensure visibility
  const effectiveTheme = theme === 'transparent' ? 'blue' : theme;

  if (bgGradient?.enabled && bgGradient.stops.length > 0) {
    const sorted = [...bgGradient.stops].sort((a, b) => a.offset - b.offset);
    gradientStops1 = sorted.map((s, i) => <stop key={i} offset={`${s.offset * 100}%`} stopColor={s.color} />);
    
    // Reverse for variety in the second blob type
    gradientStops2 = [...sorted].reverse().map((s, i) => <stop key={i} offset={`${(1 - s.offset) * 100}%`} stopColor={s.color} />);
  } else if (bgColor) {
    gradientStops1 = [<stop key="0" offset="0%" stopColor={bgColor} />, <stop key="1" offset="100%" stopColor={bgColor} />];
    gradientStops2 = gradientStops1;
  } else {
    // Fallback to theme
    const t = themes[effectiveTheme] || themes.blue;
    bg = t.bg;
    gradientStops1 = [
        <stop key="0" offset="0%" stopColor={t.from} />,
        <stop key="1" offset="100%" stopColor={t.to} />
    ];
    gradientStops2 = [
        <stop key="0" offset="0%" stopColor={t.to} />,
        <stop key="1" offset="100%" stopColor={t.from} />
    ];
  }

  // Ensure background is not transparent for Ethereal unless explicitly desired (which is rare for this style)
  if (bg === 'transparent') bg = '#0f172a';

  // Generate blobs logic (memoized to prevent re-calculation on every render)
  const blobs = useMemo(() => {
    const padding = 250;
    const minX = padding;
    const maxX = width - padding;
    const minY = 150;
    const maxY = height - 250;
    const segmentWidth = (maxX - minX) / blobCount;

    return Array.from({ length: blobCount }).map((_, i) => {
      // Deterministic pseudo-random numbers
      const r1 = ((i + 1) * 137.508) % 1;
      const r2 = ((i + 1) * 211.31) % 1;
      const r3 = ((i + 1) * 73.19) % 1;
      
      const startX = minX + (i * segmentWidth) + (r1 * segmentWidth * 0.5);
      const startY = minY + (r2 * (maxY - minY));
      
      // Calculate drift
      let driftX = (r3 > 0.5 ? 1 : -1) * (150 + (r1 * 150));
      let driftY = (r2 - 0.5) * 200;

      // Bounce off walls
      if (startX + driftX > maxX) driftX = -Math.abs(driftX);
      if (startX + driftX < minX) driftX = Math.abs(driftX);
      if (startY + driftY > maxY) driftY = -Math.abs(driftY);
      if (startY + driftY < minY) driftY = Math.abs(driftY);

      const midX = startX + driftX;
      const midY = startY + driftY;
      const r = 60 + (r2 * 40);
      const dur = 20 + (r1 * 10);
      const fill = i % 2 === 0 ? 'url(#blob1)' : 'url(#blob2)';
      
      return (
        <circle key={i} r={r} fill={fill}>
          <animate 
            attributeName="cx" 
            values={`${startX}; ${midX}; ${startX}`} 
            keyTimes="0; 0.5; 1" 
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" 
            calcMode="spline" 
            dur={`${dur}s`} 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="cy" 
            values={`${startY}; ${midY}; ${startY}`} 
            keyTimes="0; 0.5; 1" 
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" 
            calcMode="spline" 
            dur={`${dur}s`} 
            repeatCount="indefinite" 
          />
        </circle>
      );
    });
  }, [width, height, blobCount]);

  // Removed the early return for transparent theme since we now handle it gracefully
  // if (theme === 'transparent' && !bgColor && !bgGradient?.enabled) return null;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      xmlns="http://www.w3.org/2000/svg" 
      className="w-full h-full"
      style={{ backgroundColor: bg }}
    >
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="60" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -7" result="goo" />
        </filter>
        <linearGradient id="blob1" x1="0%" y1="0%" x2="100%" y2="100%">
          {gradientStops1}
        </linearGradient>
        <linearGradient id="blob2" x1="100%" y1="0%" x2="0%" y2="100%">
          {gradientStops2}
        </linearGradient>
      </defs>
      <g filter="url(#goo)" opacity="0.8">
        {blobs}
      </g>
    </svg>
  );
};
