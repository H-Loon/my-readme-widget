/**
 * BadgeSvgView.ts
 * 
 * This class is responsible for generating the final SVG string for the widget.
 * It acts as a server-side (or client-side) renderer that takes the widget state
 * and produces a standalone SVG file that can be embedded in a GitHub README.
 * 
 * Key Responsibilities:
 * - Rendering text elements with precise positioning, styling, and effects (shadows, neon).
 * - Rendering image elements, including fetching remote images and converting them to Base64
 *   to ensure the SVG is self-contained.
 * - Generating dynamic backgrounds, including complex "ethereal" blob animations using SVG filters.
 * - Handling font imports (Google Fonts) to ensure text looks correct.
 * 
 * Updates:
 * - Improved fallback logic to prevent unwanted backgrounds when style is 'transparent'.
 */
export class BadgeSvgView {
  /**
   * Generates the SVG string for a given widget configuration.
   * @param data The widget data object containing elements, dimensions, and theme settings.
   * @returns A Promise that resolves to the SVG string.
   */
  static async render(data: any): Promise<string> {
    // Destructure widget properties with default values
    const {
      elements = [],
      width = 1400,
      height = 600,
      theme = 'blue',
      style = 'ethereal',
      blobCount = 5,
      customFrom = '',
      customTo = '',
      customBgUrl = '',
      bgFit = 'cover',
      bgColor = '',
      blobColor = '',
      bgGradient = null
    } = data;

    // Define color themes mapping
    const themes: any = {
      blue: { from: '#2563eb', to: '#06b6d4', text: '#ffffff', bg: '#0f172a' },
      purple: { from: '#7c3aed', to: '#db2777', text: '#ffffff', bg: '#2e1065' },
      green: { from: '#059669', to: '#84cc16', text: '#ffffff', bg: '#064e3b' },
      orange: { from: '#ea580c', to: '#f59e0b', text: '#ffffff', bg: '#431407' },
      transparent: { from: 'transparent', to: 'transparent', text: '#334155', bg: 'transparent' },
      custom: { from: customFrom || '#6366f1', to: customTo || '#ec4899', text: '#ffffff', bg: '#0f172a' }
    };
    const t = themes[theme] || themes.blue;

    /**
     * Helper function to fetch an image from a URL and convert it to a Base64 data URI.
     * This is crucial for embedding images directly into the SVG so they work in READMEs
     * without relying on external hosting or hotlinking protection.
     */
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

    // Process all elements (Text and Images) and generate their SVG markup
    const renderedElements = await Promise.all(elements.map(async (el: any, index: number) => {
      // --- Text Element Rendering ---
      if (el.type === 'text' || !el.type) {
        const fontWeight = el.bold ? 'bold' : 'normal';
        const fontStyle = el.italic ? 'italic' : 'normal';
        const textDecoration = el.underline ? 'underline' : 'none';

        let fontFamily = el.fontFamily || 'sans-serif';
        let fontImport = '';

        // Map alignment to SVG text-anchor
        let textAnchor = el.align || 'start';
        if (textAnchor === 'left') textAnchor = 'start';
        if (textAnchor === 'center') textAnchor = 'middle';
        if (textAnchor === 'right') textAnchor = 'end';

        // Normalize generic font families
        if (fontFamily === 'sans-serif') fontFamily = 'Arial, Helvetica, sans-serif';

        // Check if it's a Google Font and generate the import style tag
        // Heuristic: Starts with uppercase and is not a standard web safe font
        const standardFonts = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 'Trebuchet MS', 'Impact'];
        if (!standardFonts.includes(fontFamily) && /^[A-Z]/.test(fontFamily)) {
          fontImport = `<style>@import url('https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}&amp;display=swap');</style>`;
        }

        let fill = el.color;
        let defs = fontImport ? `<defs>${fontImport}</defs>` : '';

        // Sanitize text content for XML
        const safeText = (el.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // Match CanvasEditor logic: remove \r entirely to ensure line count and content matches
        const lines = safeText.replace(/\r/g, '').split('\n');
        
        // Calculate approximate dimensions for gradient calculations
        const w = el.width || (safeText.length * el.size * 0.6) || 100;
        const h = el.height || el.size || 20;

        let svgTextAnchor = textAnchor;
        let xOffset = 0;

        // Background Logic
        let bgRect = '';
        if (el.textBg?.enabled) {
            const padding = el.textBg.padding ?? 4;
            const bgOpacity = el.textBg.opacity ?? 1;
            const bgColor = el.textBg.color || '#000000';
            const radius = el.textBg.borderRadius ?? 4;
            
            if (el.textBg.mode === 'block') {
                // Block mode: Standard bounding box around the text (previously 'fit')
                let bgX = -padding;
                let bgY = -padding;
                let bgW = w + (padding * 2);
                let bgH = h + (padding * 2);
                
                if (svgTextAnchor === 'middle') {
                    bgX = -(w / 2) - padding;
                } else if (svgTextAnchor === 'end') {
                    bgX = -w - padding;
                }
                
                bgRect = `<rect x="${bgX}" y="${bgY}" width="${bgW}" height="${bgH}" fill="${bgColor}" fill-opacity="${bgOpacity}" rx="${radius}" ry="${radius}" />`;
            } else {
                // Fit mode: Tight background per line (only under letters)
                // We need to estimate line widths
                const lineHeight = el.size * 1.1;
                
                bgRect = lines.map((line: string, i: number) => {
                    // Skip empty lines
                    if (!line || line.trim() === '') return '';

                    // Use stored line width if available, otherwise estimate
                    let lineWidth = 0;
                    if (el.lineWidths && el.lineWidths[i] !== undefined) {
                        lineWidth = el.lineWidths[i];
                    } else {
                        // Fallback estimation
                        lineWidth = (line.length * el.size * 0.6) || 10;
                    }
                    
                    let lineX = -padding;
                    if (svgTextAnchor === 'middle') {
                        lineX = -(lineWidth / 2) - padding;
                    } else if (svgTextAnchor === 'end') {
                        lineX = -lineWidth - padding;
                    }
                    
                    const lineY = (i * lineHeight) - padding;
                    const lineW = lineWidth + (padding * 2);
                    const lineH = el.size + (padding * 2); // Height of highlight
                    
                    return `<rect x="${lineX}" y="${lineY}" width="${lineW}" height="${lineH}" fill="${bgColor}" fill-opacity="${bgOpacity}" rx="${radius}" ry="${radius}" />`;
                }).join('');
            }
        }

        // Handle Text Gradient
        if (el.gradient?.enabled && el.gradient.stops && el.gradient.stops.length > 0) {
          const gradId = `grad_${index}`;
          const angle = el.gradient.angle || 90;

          // Calculate gradient vector based on text dimensions and angle
          let cx = 0;
          if (textAnchor === 'start') cx = w / 2;
          else if (textAnchor === 'end') cx = -w / 2;
          
          const cy = h / 2;

          const rad = ((angle - 90) * Math.PI) / 180;
          const r = Math.sqrt(w * w + h * h) / 2;

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

        // Handle Text Effects (Neon Glow or Shadow)
        let shadowStyle = '';
        let strokeAttr = '';
        if (el.neon?.enabled) {
          const propagation = el.neon.propagation || 2;
          // CSS text-shadow for neon effect
          shadowStyle = `text-shadow: 0 0 ${el.neon.intensity}px ${el.neon.color}, 0 0 ${el.neon.intensity * propagation}px ${el.neon.color};`;
          strokeAttr = `stroke="${el.neon.color}" stroke-width="${el.neon.strokeWidth || 2}"`;
        } else if (el.shadowEnabled && el.shadowColor && el.shadowColor !== 'transparent') {
          shadowStyle = `text-shadow: ${el.shadowOffsetX || 0}px ${el.shadowOffsetY || 0}px ${el.shadowBlur || 0}px ${el.shadowColor};`;
        }

        const letterSpacingAttr = el.letterSpacing ? `letter-spacing="${el.letterSpacing}px"` : '';

        // Handle Multi-line Text
        // We manually calculate the X position of each line to ensure it matches the background perfectly
        // This replaces the native text-anchor behavior which can be inconsistent with our background logic
        const decorationAttr = el.underline ? 'text-decoration="underline"' : '';
        const lineHeight = 1.1; // em

        const textContent = lines.map((line: string, i: number) => {
            const dy = i === 0 ? 0 : lineHeight;
            const content = line === '' ? '&#8203;' : line; // Zero-width space for empty lines
            
            // Calculate X position based on alignment and line width
            let lineWidth = 0;
            if (el.lineWidths && el.lineWidths[i] !== undefined) {
                lineWidth = el.lineWidths[i];
            } else {
                lineWidth = (line.length * el.size * 0.6) || 0;
            }

            let lineX = 0;
            if (textAnchor === 'middle') {
                lineX = -lineWidth / 2;
            } else if (textAnchor === 'end') {
                lineX = -lineWidth;
            }

            return `<tspan x="${lineX}" dy="${dy}em" ${decorationAttr}>${content}</tspan>`;
        }).join('');

        return `
          ${defs}
          <g transform="translate(${el.x + xOffset}, ${el.y}) rotate(${el.rotation || 0})">
              ${bgRect}
              <text 
              x="0" y="0" 
              opacity="${el.opacity ?? 1}"
              text-anchor="start" 
              dominant-baseline="text-before-edge"
              font-family="${fontFamily}" 
              font-size="${el.size}" 
              font-weight="${fontWeight}" 
              font-style="${fontStyle}"
              fill="${fill}"
              ${strokeAttr}
              ${letterSpacingAttr}
              style="${shadowStyle}"
              xml:space="preserve"
              >
              ${textContent}
              </text>
          </g>
        `;
      }

      // --- Image Element Rendering ---
      if (el.type === 'image') {
        let targetUrl = el.src;
        // Hack for github-readme-stats to disable animations if needed (SVG animations can be heavy)
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
            opacity="${el.opacity ?? 1}"
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

    // --- Background Rendering ---
    let backgroundSvg = '';

    // 1. Custom Background Image (Only if style is 'image')
    if (style === 'image' && customBgUrl) {
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

    // 2. Custom Gradient Background (Only if style is 'custom' or fallback)
    if (!backgroundSvg && (style === 'custom' || !style) && bgGradient && bgGradient.enabled && bgGradient.stops && bgGradient.stops.length > 0) {
      const angle = bgGradient.angle || 90;
      const rad = ((angle - 90) * Math.PI) / 180;
      
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.sqrt(width * width + height * height) / 2;

      const x1 = cx - r * Math.cos(rad);
      const y1 = cy - r * Math.sin(rad);
      const x2 = cx + r * Math.cos(rad);
      const y2 = cy + r * Math.sin(rad);

      const sortedStops = [...bgGradient.stops].sort((a: any, b: any) => a.offset - b.offset);
      const stops = sortedStops.map((s: any) =>
        `<stop offset="${s.offset * 100}%" stop-color="${s.color}" />`
      ).join('');

      backgroundSvg = `
        <defs>
          <linearGradient id="bgGrad" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse">
            ${stops}
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
      `;
    }

    // 3. Custom Solid Color Background (Only if style is 'custom' or fallback)
    if (!backgroundSvg && (style === 'custom' || !style)) {
      const fill = bgColor || '#0f172a';
      backgroundSvg = `<rect width="${width}" height="${height}" fill="${fill}" />`;
    }

    // 4. Ethereal Animated Blobs Background
    if (!backgroundSvg && style === 'ethereal') {
      const effectiveTheme = theme === 'transparent' ? 'blue' : theme;
      const t = themes[effectiveTheme] || themes.blue;
      
      // Determine background fill (solid or gradient)
      // For Ethereal, we want transparent background by default unless specified
      // But if we want to support a custom background color BEHIND blobs, we could use bgColor.
      // However, the user requested transparency. So we will NOT render a background rect unless needed.
      
      // Determine gradient colors for blobs
      let blob1Stops = '';
      let blob2Stops = '';

      if (bgGradient && bgGradient.enabled && bgGradient.stops && bgGradient.stops.length > 0) {
        const sorted = [...bgGradient.stops].sort((a: any, b: any) => a.offset - b.offset);
        blob1Stops = sorted.map((s: any) => `<stop offset="${s.offset * 100}%" stop-color="${s.color}" />`).join('');
        // Reverse for variety
        blob2Stops = [...sorted].reverse().map((s: any) => `<stop offset="${(1 - s.offset) * 100}%" stop-color="${s.color}" />`).join('');
      } else if (blobColor) {
        blob1Stops = `<stop offset="0%" stop-color="${blobColor}" /><stop offset="100%" stop-color="${blobColor}" />`;
        blob2Stops = blob1Stops;
      } else if (bgColor) {
        blob1Stops = `<stop offset="0%" stop-color="${bgColor}" /><stop offset="100%" stop-color="${bgColor}" />`;
        blob2Stops = blob1Stops;
      } else {
        blob1Stops = `<stop offset="0%" stop-color="${t.from}" /><stop offset="100%" stop-color="${t.to}" />`;
        blob2Stops = `<stop offset="0%" stop-color="${t.to}" /><stop offset="100%" stop-color="${t.from}" />`;
      }
      
      const padding = 120;
      const minX = padding;
      const maxX = width - padding;
      const minY = padding;
      const maxY = height - padding;
      const segmentWidth = (maxX - minX) / blobCount;

      // Generate random blobs with animations
      const blobCode = Array.from({ length: blobCount }).map((_, i) => {
        // Deterministic pseudo-random numbers based on index to keep blobs consistent across renders if needed
        const r1 = ((i + 1) * 137.508) % 1;
        const r2 = ((i + 1) * 211.31) % 1;
        const r3 = ((i + 1) * 73.19) % 1;
        
        const startX = minX + (i * segmentWidth) + (r1 * segmentWidth * 0.5);
        const startY = minY + (r2 * (maxY - minY));
        
        // Calculate drift for animation
        let driftX = (r3 > 0.5 ? 1 : -1) * (150 + (r1 * 150));
        let driftY = (r2 - 0.5) * 200;

        // Bounce off walls logic
        if (startX + driftX > maxX) driftX = -Math.abs(driftX);
        if (startX + driftX < minX) driftX = Math.abs(driftX);
        if (startY + driftY > maxY) driftY = -Math.abs(driftY);
        if (startY + driftY < minY) driftY = Math.abs(driftY);

        const midX = startX + driftX;
        const midY = startY + driftY;
        const r = 60 + (r2 * 40);
        const dur = 20 + (r1 * 10);
        const fill = i % 2 === 0 ? 'url(#blob1)' : 'url(#blob2)';
        
        // SVG Animate tags for movement
        return `<circle r="${r}" fill="${fill}"><animate attributeName="cx" values="${startX}; ${midX}; ${startX}" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="${dur}s" repeatCount="indefinite" /><animate attributeName="cy" values="${startY}; ${midY}; ${startY}" keyTimes="0; 0.5; 1" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" calcMode="spline" dur="${dur}s" repeatCount="indefinite" /></circle>`;
      }).join('');

      // Apply Gooey filter for liquid effect
      backgroundSvg = `
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="60" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -7" result="goo" />
          </filter>
          <linearGradient id="blob1" x1="0%" y1="0%" x2="100%" y2="100%">${blob1Stops}</linearGradient>
          <linearGradient id="blob2" x1="100%" y1="0%" x2="0%" y2="100%">${blob2Stops}</linearGradient>
        </defs>
        <g filter="url(#goo)" opacity="0.8">${blobCode}</g>
      `;
    }

    // 3. Simple Gradient Background (Fallback)
    if (!backgroundSvg && style !== 'transparent') {
      if (theme !== 'transparent') {
        backgroundSvg = `
          <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${t.from}" /><stop offset="100%" stop-color="${t.to}" /></linearGradient></defs>
          <rect width="${width}" height="${height}" fill="${t.bg}" />
          <circle cx="${width - 200}" cy="100" r="300" fill="url(#grad)" opacity="0.2" />
          <circle cx="100" cy="${height - 100}" r="300" fill="url(#grad)" opacity="0.2" />
        `;
      }
    }

    // Assemble final SVG
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" overflow="hidden">
        ${backgroundSvg}
        ${contentSvg}
      </svg>`;
  }
}
