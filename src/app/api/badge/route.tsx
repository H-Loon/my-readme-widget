export const dynamic = 'force-dynamic'; 

import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  let elements: any[] = [];
  let canvasWidth = 1400;
  let canvasHeight = 600;
  let theme = 'blue';
  let style = 'ethereal';
  let blobCount = 5;
  let customFrom = '';
  let customTo = '';
  let customBgUrl = '';
  let bgFit = 'cover';

  const id = searchParams.get('id');
  
  if (id) {
    try {
      const docRef = doc(db, "widgets", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`Fetching widget ${id}:`, JSON.stringify(data));
        elements = data.elements || [];
        canvasWidth = data.width || 1400;
        canvasHeight = data.height || 600;
        theme = data.theme || 'blue';
        style = data.style || 'ethereal';
        blobCount = data.blobCount || 5;
        customFrom = data.customFrom || '';
        customTo = data.customTo || '';
        customBgUrl = data.bgImage || '';
        bgFit = data.bgFit || 'cover';
      }
    } catch (error) {
      console.error("Error fetching from DB:", error);
    }
  } 
  
  if (elements.length === 0) {
     const rawData = searchParams.get('data');
     if (rawData) {
       try { elements = JSON.parse(rawData); } catch(e) {}
     } else {
       elements = [
        { type: 'text', text: "Hi, I'm Developer", x: 700, y: 200, size: 48, color: "#334155", bold: true, align: "middle" },
        { type: 'text', text: "Building things for the web", x: 700, y: 260, size: 24, color: "#64748b", bold: false, align: "middle" }
       ];
     }
     canvasHeight = parseInt(searchParams.get('h') || '600');
     canvasWidth = parseInt(searchParams.get('w') || '1400');
     style = searchParams.get('style') || 'ethereal';
     theme = searchParams.get('theme') || 'blue';
     blobCount = parseInt(searchParams.get('blobs') || '5');
     customFrom = searchParams.get('from') || '';
     customTo = searchParams.get('to') || '';
     customBgUrl = searchParams.get('bg') || '';
     bgFit = searchParams.get('bgFit') || 'cover';
  }
  
  const width = canvasWidth;
  const height = canvasHeight;

  const themes: any = {
    blue: { from: '#2563eb', to: '#06b6d4', text: '#ffffff', bg: '#0f172a' },
    purple: { from: '#7c3aed', to: '#db2777', text: '#ffffff', bg: '#2e1065' },
    green: { from: '#059669', to: '#84cc16', text: '#ffffff', bg: '#064e3b' },
    orange: { from: '#ea580c', to: '#f59e0b', text: '#ffffff', bg: '#431407' },
    custom: { from: customFrom || '#6366f1', to: customTo || '#ec4899', text: '#ffffff', bg: '#0f172a' }
  };
  const t = themes[theme] || themes.blue;

  const fetchImageToBase64 = async (url: string) => {
    try {
      const imgRes = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ReadmeWidget/1.0)' }
      });
      if (!imgRes.ok) return null;
      
      const arrayBuffer = await imgRes.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(arrayBuffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
      
      const base64 = btoa(binary);
      const contentType = imgRes.headers.get('content-type') || 'image/png';
      return `data:${contentType};base64,${base64}`;
    } catch (e) {
      console.error("Error fetching image:", url, e);
      return null;
    }
  };

  const renderedElements = await Promise.all(elements.map(async (el: any, index: number) => {
    if (el.type === 'text' || !el.type) {
      const fontWeight = el.bold ? 'bold' : 'normal';
      const fontStyle = el.italic ? 'italic' : 'normal';
      const textDecoration = el.underline ? 'underline' : 'none';
      const safeText = (el.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      let fontFamily = el.fontFamily || 'sans-serif';
      let fontImport = '';
      
      // Check if it's a Google Font (simple heuristic: starts with uppercase and not in standard list)
      const standardFonts = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 'Trebuchet MS', 'Impact'];
      if (!standardFonts.includes(fontFamily) && /^[A-Z]/.test(fontFamily)) {
          // Attempt to import Google Font
          // Note: This works in browsers but often not in <img> tags due to security/CORS
          // However, it's the best we can do without embedding the font file (which is huge)
          fontImport = `<style>@import url('https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}&display=swap');</style>`;
      }
      
      if (fontFamily === 'sans-serif') fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
      else if (fontFamily === 'serif') fontFamily = "Georgia, 'Times New Roman', Times, serif";
      else if (fontFamily === 'monospace') fontFamily = "'Courier New', Courier, monospace";
      else if (fontFamily === 'cursive') fontFamily = "'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', sans-serif";
      else if (fontFamily === 'fantasy') fontFamily = "Impact, fantasy";

      let fill = el.color;
      let defs = fontImport ? `<defs>${fontImport}</defs>` : '';
      
      if (el.gradient?.enabled && el.gradient.stops && el.gradient.stops.length > 0) {
         const gradId = `grad_${index}`;
         const angle = el.gradient.angle || 90;
         
         // Use stored dimensions if available, otherwise estimate
         const w = el.width || (safeText.length * el.size * 0.6) || 100;
         const h = el.height || el.size || 20;
         
         // Local center (relative to text origin 0,0)
         const cx = w / 2;
         const cy = h / 2;
         
         const rad = ((angle - 90) * Math.PI) / 180;
         const r = Math.sqrt(w*w + h*h) / 2;
         
         const x1 = cx - r * Math.cos(rad);
         const y1 = cy - r * Math.sin(rad);
         const x2 = cx + r * Math.cos(rad);
         const y2 = cy + r * Math.sin(rad);
         
         const sortedStops = [...el.gradient.stops].sort((a: any, b: any) => a.offset - b.offset);
         const stops = sortedStops.map((s: any) => 
            `<stop offset="${s.offset * 100}%" stop-color="${s.color}" />`
         ).join('');

         defs += `
           <defs>
             <linearGradient id="${gradId}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse">
               ${stops}
             </linearGradient>
           </defs>
         `;
         fill = `url(#${gradId})`;
      }

      let shadowStyle = '';
      if (el.neon?.enabled) {
          shadowStyle = `text-shadow: 0 0 ${el.neon.intensity}px ${el.neon.color}, 0 0 ${el.neon.intensity * 2}px ${el.neon.color};`;
      } else if (el.shadowColor && el.shadowColor !== 'transparent') {
          shadowStyle = `text-shadow: ${el.shadowOffsetX || 0}px ${el.shadowOffsetY || 0}px ${el.shadowBlur || 0}px ${el.shadowColor};`;
      }

      return `
        ${defs}
        <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})">
            <text 
            x="0" y="0" 
            text-anchor="start" 
            dominant-baseline="text-before-edge"
            font-family="${fontFamily}" 
            font-size="${el.size}" 
            font-weight="${fontWeight}" 
            font-style="${fontStyle}"
            fill="${fill}"
            text-decoration="${textDecoration}"
            style="text-decoration: ${textDecoration}; ${shadowStyle}"
            >
            ${safeText}
            </text>
        </g>
      `;
    }

    if (el.type === 'image') {
      let targetUrl = el.src;
      if (targetUrl.includes('github-readme-stats.vercel.app') && !targetUrl.includes('disable_animations')) {
         targetUrl += targetUrl.includes('?') ? '&disable_animations=true' : '?disable_animations=true';
      }

      const dataUri = await fetchImageToBase64(targetUrl);
      if (!dataUri) return '';

      let xPos = el.x;
      let yPos = el.y;
      let preserveRatio = "xMidYMid meet"; 
      if (el.fit === 'cover') preserveRatio = "xMidYMid slice";
      if (el.fit === 'stretch') preserveRatio = "none";

      const rotation = el.rotation || 0;
      const transform = rotation ? `transform="rotate(${rotation}, ${xPos}, ${yPos})"` : '';

      return `
        <image 
          href="${dataUri}" 
          x="${xPos}" 
          y="${yPos}" 
          ${transform}
          width="${el.width}" 
          height="${el.height}" 
          preserveAspectRatio="${preserveRatio}"
        />
      `;
    }
    return '';
  }));

  const contentSvg = renderedElements.join('');

  let backgroundSvg = '';

  if (customBgUrl) {
    const bgDataUri = await fetchImageToBase64(customBgUrl);
    if (bgDataUri) {
      let preserveRatio = "xMidYMid slice"; // cover
      if (bgFit === 'contain') preserveRatio = "xMidYMid meet";
      if (bgFit === 'stretch') preserveRatio = "none";

      backgroundSvg = `
        <image href="${bgDataUri}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="${preserveRatio}" />
      `;
    }
  }
  
  if (!backgroundSvg && style === 'ethereal') {
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
  } 
  
  if (!backgroundSvg) {
    backgroundSvg = `
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${t.from}" /><stop offset="100%" stop-color="${t.to}" /></linearGradient></defs>
      <rect width="${width}" height="${height}" fill="${t.bg}" />
      <circle cx="${width - 200}" cy="100" r="300" fill="url(#grad)" opacity="0.2" />
      <circle cx="100" cy="${height - 100}" r="300" fill="url(#grad)" opacity="0.2" />
    `;
  }

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" overflow="hidden">
      <!-- Debug: id=${id}, bgFit=${bgFit} -->
      ${backgroundSvg}
      ${contentSvg}
    </svg>`;

  return new Response(svg, { 
    headers: { 
      'Content-Type': 'image/svg+xml', 
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    } 
  });
}