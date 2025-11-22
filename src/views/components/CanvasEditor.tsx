/**
 * CanvasEditor.tsx
 * 
 * The core component of the application.
 * Renders the interactive canvas where users can drag, drop, resize, and edit elements.
 * Uses 'react-konva' which is a React wrapper for the Konva.js 2D canvas library.
 */
'use client';
import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Text, Image as KonvaImage, Transformer, Rect, Group, Line } from 'react-konva';
import useImage from 'use-image';
import { EtherealBackground } from './EtherealBackground';

// Grid size for snapping (20px)
const GRID_SIZE = 20;

// Interface for gradient color stops
interface GradientStop {
  offset: number;
  color: string;
}

// Interface defining the structure of an element on the canvas
interface CanvasElement {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  text?: string;
  color?: string;
  size?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'start' | 'middle' | 'end';
  fontFamily?: string;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  neon?: {
    enabled: boolean;
    color: string;
    intensity: number;
    propagation?: number;
    strokeWidth?: number;
  };
  gradient?: {
    enabled: boolean;
    type: 'linear';
    angle: number;
    stops: GradientStop[];
  };
  src?: string;
  width?: number;
  height?: number;
  scale?: number;
  rotation?: number;
  fit?: 'contain' | 'cover' | 'stretch';
}

// Props for the CanvasEditor component
interface CanvasEditorProps {
  width: number;
  height: number;
  elements: CanvasElement[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onChange: (newElements: CanvasElement[], saveHistory?: boolean) => void;
  bgImage?: string;
  bgFit?: 'cover' | 'contain' | 'stretch';
  theme?: string;
  customFrom?: string;
  customTo?: string;
  blobCount?: number;
  showGrid?: boolean;
  style?: string;
  bgColor?: string;
  blobColor?: string;
  bgGradient?: {
    enabled: boolean;
    type: 'linear';
    angle: number;
    stops: GradientStop[];
  };
}

/**
 * URLImage Component
 * Renders an image from a URL onto the canvas.
 * Handles proxying for certain domains to avoid CORS issues.
 */
const URLImage = ({ src, element, isSelected, onSelect, onChange, showGrid, onRegister, onDragStart, onDragMove, onDragEnd, onTransformEnd }: any) => {
  // Fix for github-readme-stats and skillicons to ensure they render in Canvas
  // We use a proxy to fetch the image and avoid CORS/Canvas tainting issues
  // and to ensure the SVG is served with correct headers
  const shouldUseProxy = src && (
    src.includes('github-readme-stats.vercel.app') ||
    src.includes('skillicons.dev')
  );

  let imageSrc = src;
  if (shouldUseProxy) {
    let urlToProxy = src;
    if (src.includes('github-readme-stats.vercel.app') && !src.includes('disable_animations')) {
      urlToProxy = src + (src.includes('?') ? '&disable_animations=true' : '?disable_animations=true');
    }
    imageSrc = `/api/proxy-image?url=${encodeURIComponent(urlToProxy)}`;
  }

  // useImage hook loads the image asynchronously
  const [image] = useImage(imageSrc, 'anonymous');
  const shapeRef = useRef<any>(null);

  // Register the shape ref with the parent so Transformer can attach to it
  useEffect(() => {
    if (shapeRef.current) {
      onRegister(element.id, shapeRef.current);
    }
  }, [element.id, onRegister]);

  return (
    <KonvaImage
      image={image}
      ref={shapeRef}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation || 0}
      opacity={element.opacity ?? 1}
      draggable
      name="object"
      id={element.id}
      // Snap to grid logic during drag
      dragBoundFunc={(pos) => {
        if (!showGrid) return pos;
        return {
          x: Math.round(pos.x / GRID_SIZE) * GRID_SIZE,
          y: Math.round(pos.y / GRID_SIZE) * GRID_SIZE
        };
      }}
      onClick={(e) => onSelect(element.id, e)}
      onTap={(e) => onSelect(element.id, e)}
      onDragStart={(e) => onDragStart(e, element.id)}
      onDragMove={(e) => onDragMove(e, element.id)}
      onDragEnd={(e) => onDragEnd(e, element.id)}
      onTransformEnd={(e) => onTransformEnd(e, element.id)}
    />
  );
};

/**
 * EditableText Component
 * Renders text that can be styled, resized, and moved.
 * Handles gradients, shadows, and neon effects.
 */
const EditableText = ({ element, isSelected, onSelect, onChange, showGrid, onRegister, onDragStart, onDragMove, onDragEnd, onTransformEnd, canvasWidth }: any) => {
  const shapeRef = useRef<any>(null);
  const textRef = useRef<any>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  useEffect(() => {
    if (shapeRef.current) {
      onRegister(element.id, shapeRef.current);
    }
  }, [element.id, onRegister]);

  // Measure text dimensions when properties change
  useEffect(() => {
    if (textRef.current) {
      const w = textRef.current.width();
      const h = textRef.current.height();

      setDimensions({ width: w, height: h });

      // Calculate line widths for accurate SVG rendering
      // Sanitize text to match SVG rendering logic (remove \r)
      const cleanText = (element.text || '').replace(/\r/g, '');
      const lines = cleanText.split('\n');
      const calculatedLineWidths = lines.map((line: string) => {
        if (!line) return 0;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
           ctx.font = `${element.bold ? 'bold ' : ''}${element.italic ? 'italic ' : ''}${element.size}px ${element.fontFamily}`;
           let width = ctx.measureText(line).width;
           // Add letter spacing if present
           if (element.letterSpacing && line.length > 1) {
             width += (line.length - 1) * element.letterSpacing;
           }
           return width;
        }
        return 0;
      });

      // Check if line widths changed
      const lineWidthsChanged = !element.lineWidths || 
        element.lineWidths.length !== calculatedLineWidths.length ||
        element.lineWidths.some((lw: number, i: number) => Math.abs(lw - calculatedLineWidths[i]) > 1);

      // Sync dimensions to parent state for SVG generation
      if (Math.abs(w - (element.width || 0)) > 1 || Math.abs(h - (element.height || 0)) > 1 || lineWidthsChanged) {
        // Use a timeout to avoid render cycle warnings or conflicts
        setTimeout(() => {
          onChange({
            ...element,
            width: w,
            height: h,
            lineWidths: calculatedLineWidths
          }, false);
        }, 0);
      }
    }
  }, [element.text, element.size, element.fontFamily, element.bold, element.italic, element.width, element.height, element.textBg, element.lineWidths]);

  // Gradient logic
  let fillProps: any = {
    fill: element.color,
    fillPriority: 'color'
  };
  if (element.gradient?.enabled && element.gradient.stops && element.gradient.stops.length > 0) {
    // Convert angle to radians. 0deg is usually top, 90deg right.
    // Adjusting to match standard CSS linear-gradient direction
    const angleRad = (element.gradient.angle - 90) * (Math.PI / 180);

    const w = dimensions.width || 100;
    const h = dimensions.height || 20;

    // Center
    const cx = w / 2;
    const cy = h / 2;

    // Radius (half diagonal) to ensure gradient covers the whole text
    const r = Math.sqrt(w * w + h * h) / 2;

    const startX = cx - r * Math.cos(angleRad);
    const startY = cy - r * Math.sin(angleRad);
    const endX = cx + r * Math.cos(angleRad);
    const endY = cy + r * Math.sin(angleRad);

    const sortedStops = [...element.gradient.stops].sort((a: any, b: any) => a.offset - b.offset);
    const stops = sortedStops.flatMap((s: any) => [s.offset, s.color]);

    fillProps = {
      fillLinearGradientStartPoint: { x: startX, y: startY },
      fillLinearGradientEndPoint: { x: endX, y: endY },
      fillLinearGradientColorStops: stops,
      fillPriority: 'linear-gradient'
    };
  }

  // Shadow / Neon logic
  let shadowProps = {
    shadowColor: 'transparent',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowOpacity: 0
  };

  let strokeProps = {};

  if (element.neon?.enabled) {
    const propagation = element.neon.propagation || 2;
    shadowProps = {
      shadowColor: element.neon.color,
      shadowBlur: element.neon.intensity * propagation,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowOpacity: 1
    };
    strokeProps = {
      stroke: element.neon.color,
      strokeWidth: element.neon.strokeWidth || 2
    };
  } else if (element.shadowEnabled) {
    shadowProps = {
      shadowColor: element.shadowColor || 'black',
      shadowBlur: element.shadowBlur || 0,
      shadowOffsetX: element.shadowOffsetX || 0,
      shadowOffsetY: element.shadowOffsetY || 0,
      shadowOpacity: 1
    };
  }

  // Calculate offset based on alignment to simulate text-anchor behavior
  const currentWidth = dimensions.width || element.width || 0;
  const currentHeight = dimensions.height || element.height || 0;
  let offsetX = 0;
  if (element.align === 'middle') {
    offsetX = currentWidth / 2;
  } else if (element.align === 'end') {
    offsetX = currentWidth;
  }

  // Background Logic
  const bg = element.textBg;
  let bgRect = null;
  if (bg && bg.enabled) {
    const padding = bg.padding || 0;
    
    if (bg.mode === 'block') {
      // Block mode: Standard bounding box around the text (previously 'fit')
      let bgX = -offsetX - padding;
      let bgY = -padding;
      let bgW = currentWidth + (padding * 2);
      let bgH = currentHeight + (padding * 2);

      bgRect = (
        <Rect
          x={bgX}
          y={bgY}
          width={bgW}
          height={bgH}
          fill={bg.color}
          opacity={bg.opacity}
          cornerRadius={bg.borderRadius || 0}
        />
      );
    } else {
      // Fit mode: Tight background per line (only under letters)
      // We need to measure each line individually
      const cleanText = (element.text || '').replace(/\r/g, '');
      const lines = cleanText.split('\n');
      const lineHeight = element.size * 1.1; // Match SVG line height
      
      bgRect = (
        <>
          {lines.map((line: string, i: number) => {
            // Skip empty lines (newlines)
            if (!line || line.trim() === '') return null;

            // Create a temporary text object to measure width
            // This is expensive in render loop, but necessary for "tight fit"
            // Optimization: Memoize or use canvas context measureText
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
               ctx.font = `${element.bold ? 'bold ' : ''}${element.italic ? 'italic ' : ''}${element.size}px ${element.fontFamily}`;
               let lineWidth = ctx.measureText(line).width;
               if (element.letterSpacing && line.length > 1) {
                 lineWidth += (line.length - 1) * element.letterSpacing;
               }
               
               // Calculate X offset based on alignment
               let lineX = -padding;
               if (element.align === 'middle') {
                 lineX = -lineWidth / 2 - padding;
               } else if (element.align === 'end') {
                 lineX = -lineWidth - padding;
               } else {
                 // Left align
                 lineX = -padding; // relative to 0 (which is left edge of text group)
               }

               return (
                 <Rect
                   key={i}
                   x={lineX}
                   y={(i * lineHeight) - padding} // Approximate Y position
                   width={lineWidth + (padding * 2)}
                   height={element.size + (padding * 2)} // Height of the highlight
                   fill={bg.color}
                   opacity={bg.opacity}
                   cornerRadius={bg.borderRadius || 0}
                 />
               );
            }
            return null;
          })}
        </>
      );
    }
  }

  return (
    <Group
      ref={shapeRef}
      x={element.x}
      y={element.y}
      draggable
      rotation={element.rotation || 0}
      name="object"
      id={element.id}
      dragBoundFunc={(pos) => {
        if (!showGrid) return pos;
        
        // Snap the visual left edge to the grid
        // Visual Left = pos.x - offsetX
        // We want Visual Left to be k * GRID_SIZE
        // So pos.x = k * GRID_SIZE + offsetX
        
        const snappedVisualLeft = Math.round((pos.x - offsetX) / GRID_SIZE) * GRID_SIZE;
        const snappedX = snappedVisualLeft + offsetX;

        // Snap the visual top edge to the grid
        // Visual Top = pos.y - offsetY (offsetY is 0)
        const snappedY = Math.round(pos.y / GRID_SIZE) * GRID_SIZE;

        return {
          x: snappedX,
          y: snappedY
        };
      }}
      onClick={(e) => onSelect(element.id, e)}
      onTap={(e) => onSelect(element.id, e)}
      onDragStart={(e) => onDragStart(e, element.id)}
      onDragMove={(e) => onDragMove(e, element.id)}
      onDragEnd={(e) => onDragEnd(e, element.id)}
      onTransformEnd={(e) => onTransformEnd(e, element.id)}
    >
      {bgRect}
      <Text
        ref={textRef}
        text={element.text}
        opacity={element.opacity ?? 1}
        x={0}
        y={0}
        offsetX={offsetX}
        lineHeight={1.1}
        align={element.align === 'middle' ? 'center' : element.align === 'end' ? 'right' : 'left'}
        fontSize={element.size}
        fontFamily={element.fontFamily}
        fontStyle={`${element.bold ? 'bold' : ''} ${element.italic ? 'italic' : ''}`.trim() || 'normal'}
        textDecoration={element.underline ? 'underline' : ''}
        letterSpacing={element.letterSpacing || 0}
        {...fillProps}
        {...shadowProps}
        {...strokeProps}
      />
    </Group>
  );
};

/**
 * BackgroundLayer Component
 * Renders the background image or color.
 * Handles different fit modes (cover, contain, stretch).
 */
const BackgroundLayer = ({ width, height, bgImage, bgFit, theme, customFrom, customTo, blobCount, style, bgColor, blobColor, bgGradient }: any) => {
  // Use proxy for background images to avoid CORS issues which prevent rendering in Canvas
  const imageSrc = bgImage && (bgImage.startsWith('http') || bgImage.startsWith('//'))
    ? `/api/proxy-image?url=${encodeURIComponent(bgImage)}`
    : (bgImage || '');

  const [image] = useImage(imageSrc, 'anonymous');

  // If using Ethereal style, the background is handled by the HTML layer behind the canvas
  if (style === 'ethereal') {
    return null;
  }

  // If the background is a GIF, it is handled by the HTML layer
  if (bgImage && bgImage.toLowerCase().endsWith('.gif')) {
    return null;
  }

  // Only render image if style is explicitly 'image'
  if (style === 'image' && bgImage && image) {
    let props: any = { width, height };

    if (bgFit === 'stretch') {
      props = { x: 0, y: 0, width, height };
    } else if (bgFit === 'contain') {
      const imgRatio = image.width / image.height;
      const canvasRatio = width / height;
      let w, h;
      if (imgRatio > canvasRatio) {
        w = width;
        h = width / imgRatio;
      } else {
        h = height;
        w = height * imgRatio;
      }
      props = {
        x: (width - w) / 2,
        y: (height - h) / 2,
        width: w,
        height: h
      };
    } else {
      // cover (default)
      const imgRatio = image.width / image.height;
      const canvasRatio = width / height;
      let cropX = 0, cropY = 0, cropWidth = image.width, cropHeight = image.height;

      if (imgRatio > canvasRatio) {
        cropWidth = image.height * canvasRatio;
        cropX = (image.width - cropWidth) / 2;
      } else {
        cropHeight = image.width / canvasRatio;
        cropY = (image.height - cropHeight) / 2;
      }
      props = {
        x: 0,
        y: 0,
        width,
        height,
        crop: { x: cropX, y: cropY, width: cropWidth, height: cropHeight }
      };
    }

    return <KonvaImage image={image} {...props} />;
  }

  // Fallback to simple gradient or color based on theme
  if (style === 'transparent') {
    return null;
  }

  if (style === 'custom') {
    if (bgGradient?.enabled && bgGradient.stops && bgGradient.stops.length > 0) {
       const angleRad = (bgGradient.angle - 90) * (Math.PI / 180);
       const cx = width / 2;
       const cy = height / 2;
       const r = Math.sqrt(width * width + height * height) / 2;
       const startX = cx - r * Math.cos(angleRad);
       const startY = cy - r * Math.sin(angleRad);
       const endX = cx + r * Math.cos(angleRad);
       const endY = cy + r * Math.sin(angleRad);
       
       const sortedStops = [...bgGradient.stops].sort((a: any, b: any) => a.offset - b.offset);
       const stops = sortedStops.flatMap((s: any) => [s.offset, s.color]);

       return (
         <Rect
           width={width}
           height={height}
           fillLinearGradientStartPoint={{ x: startX, y: startY }}
           fillLinearGradientEndPoint={{ x: endX, y: endY }}
           fillLinearGradientColorStops={stops}
         />
       );
    }
    return <Rect width={width} height={height} fill={bgColor || '#0f172a'} />;
  }

  let fill = '#0f172a';
  if (theme === 'blue') fill = '#0f172a';
  if (theme === 'purple') fill = '#2e1065';
  if (theme === 'green') fill = '#064e3b';
  if (theme === 'orange') fill = '#431407';
  if (theme === 'custom') fill = '#0f172a';

  // If no bgImage, we MUST render a background rect to cover the transparency grid
  return (
    <Rect width={width} height={height} fill={fill} />
  );
};

/**
 * GridLayer Component
 * Renders a grid overlay to help with alignment.
 */
const GridLayer = ({ width, height }: { width: number; height: number }) => {
  const lines = [];
  // Vertical lines
  for (let i = 0; i <= width; i += GRID_SIZE) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i, 0, i, height]}
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth={1}
        listening={false}
      />
    );
  }
  // Horizontal lines
  for (let i = 0; i <= height; i += GRID_SIZE) {
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, i, width, i]}
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth={1}
        listening={false}
      />
    );
  }
  return <Group listening={false}>{lines}</Group>;
};

/**
 * Main CanvasEditor Component
 */
export default function CanvasEditor({ width, height, elements, selectedIds, onSelect, onChange, bgImage, bgFit, theme, customFrom, customTo, blobCount, showGrid, style, bgColor, blobColor, bgGradient }: CanvasEditorProps) {
  const trRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const shapeRefs = useRef<any>({});
  const dragStartPos = useRef<{[key: string]: {x: number, y: number}}>({});

  // Register refs
  const handleRegister = (id: string, node: any) => {
    shapeRefs.current[id] = node;
  };

  // Update transformer nodes (the selection box handles)
  useEffect(() => {
    if (trRef.current && layerRef.current) {
      const nodes = selectedIds.map(id => shapeRefs.current[id]).filter(Boolean);
      trRef.current.nodes(nodes);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedIds, elements]);

  // Handle selection of elements
  const handleSelect = (id: string, e: any) => {
    const isMulti = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    
    if (isMulti) {
      if (selectedIds.includes(id)) {
        onSelect(selectedIds.filter(i => i !== id));
      } else {
        onSelect([...selectedIds, id]);
      }
    } else {
      if (!selectedIds.includes(id)) {
        onSelect([id]);
      }
    }
    e.cancelBubble = true;
  };

  // Deselect when clicking on the empty stage
  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      onSelect([]);
    }
  };

  // Handle drag start
  const onDragStart = (e: any, id: string) => {
    // If dragging an item that is NOT selected, select it (and deselect others unless multi)
    if (!selectedIds.includes(id)) {
        onSelect([id]);
        // We need to wait for state update to register refs? 
        // Actually, if we select it now, the next render will update selectedIds.
        // But the drag has already started on the node.
        // For this drag session, it might be just this node.
    }
    
    // Store initial positions of all selected nodes (including the one just clicked if it was added)
    // Note: if we just called onSelect([id]), selectedIds is not updated yet in this closure.
    // So we might miss it if we rely on selectedIds.
    // But if it wasn't selected, it's a single selection drag, so multi-drag logic doesn't apply anyway.
    
    selectedIds.forEach(sid => {
        const node = shapeRefs.current[sid];
        if (node) {
            dragStartPos.current[sid] = { x: node.x(), y: node.y() };
        }
    });
    // Also store for the current one if it wasn't in selectedIds yet (though visually it won't be multi-drag)
    if (!selectedIds.includes(id)) {
         const node = shapeRefs.current[id];
         if (node) {
             dragStartPos.current[id] = { x: node.x(), y: node.y() };
         }
    }
  };

  // Handle drag move (for multi-selection dragging)
  const onDragMove = (e: any, id: string) => {
      // If we are dragging a node that is part of the selection
      const isSelected = selectedIds.includes(id);
      if (!isSelected && selectedIds.length > 0) return; // Should not happen if we select on drag start
      
      const draggedNode = e.target;
      const startPos = dragStartPos.current[id];
      
      if (!startPos) return;
      
      const dx = draggedNode.x() - startPos.x;
      const dy = draggedNode.y() - startPos.y;
      
      selectedIds.forEach(sid => {
          if (sid !== id) {
              const node = shapeRefs.current[sid];
              const sPos = dragStartPos.current[sid];
              if (node && sPos) {
                  node.x(sPos.x + dx);
                  node.y(sPos.y + dy);
              }
          }
      });
  };

  // Handle drag end
  const onDragEnd = (e: any, id: string) => {
      // Update all selected elements in state
      // If the dragged item was not in selectedIds (e.g. single drag of unselected), we should include it.
      const idsToUpdate = selectedIds.includes(id) ? selectedIds : [id];

      const newElements = elements.map(el => {
          if (idsToUpdate.includes(el.id)) {
              const node = shapeRefs.current[el.id];
              if (node) {
                  return {
                      ...el,
                      x: node.x(),
                      y: node.y()
                  };
              }
          }
          return el;
      });
      onChange(newElements);
  };

  // Handle transform end (resize/rotate)
  const onTransformEnd = (e: any, id: string) => {
      // Transformer updates the nodes directly.
      // We need to sync back to state.
      
      const newElements = elements.map(el => {
          if (selectedIds.includes(el.id)) {
              const node = shapeRefs.current[el.id];
              if (node) {
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();
                  
                  // Reset scale to 1 and update width/height/fontSize
                  node.scaleX(1);
                  node.scaleY(1);
                  
                  const newAttrs: any = {
                      x: node.x(),
                      y: node.y(),
                      rotation: node.rotation()
                  };
                  
                  if (el.type === 'text') {
                      newAttrs.size = Math.round((el.size || 16) * scaleX);
                  } else {
                      newAttrs.width = Math.max(5, (el.width || 100) * scaleX);
                      newAttrs.height = Math.max(5, (el.height || 100) * scaleY);
                  }
                  
                  return { ...el, ...newAttrs };
              }
          }
          return el;
      });
      onChange(newElements);
  };

  const handleElementUpdate = (updatedElement: any, saveHistory: boolean = true) => {
    const newElements = elements.map(el => el.id === updatedElement.id ? updatedElement : el);
    onChange(newElements, saveHistory);
  };

  // Determine if we need to render the HTML background layer
  const isEthereal = style === 'ethereal';
  const isGif = style === 'image' && bgImage && bgImage.toLowerCase().endsWith('.gif');
  const showHtmlBackground = isEthereal || isGif;

  return (
    <div 
      className="shadow-2xl overflow-hidden relative bg-white" 
      style={{ 
        width, 
        height,
        backgroundImage: `
          linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
          linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
          linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
          linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
      }}
    >
      {/* HTML Background Layer (Sandwich Method) */}
      {showHtmlBackground && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {isEthereal && (
            <EtherealBackground
              width={width}
              height={height}
              theme={theme || 'blue'}
              blobCount={blobCount || 5}
              customFrom={customFrom}
              customTo={customTo}
              bgColor={bgColor}
              blobColor={blobColor}
              bgGradient={bgGradient}
            />
          )}
          {isGif && (
            <img 
              src={bgImage} 
              alt="Background" 
              className="w-full h-full"
              style={{ objectFit: bgFit === 'stretch' ? 'fill' : (bgFit || 'cover') }}
            />
          )}
        </div>
      )}

      {/* Konva Canvas Layer */}
      <div className="relative z-10">
        <Stage width={width} height={height} onMouseDown={checkDeselect} onTouchStart={checkDeselect}>
          <Layer ref={layerRef}>
            <BackgroundLayer
              width={width}
              height={height}
              bgImage={bgImage}
              bgFit={bgFit}
              theme={theme}
              customFrom={customFrom}
              customTo={customTo}
              blobCount={blobCount}
              style={style}
              bgColor={bgColor}
              blobColor={blobColor}
              bgGradient={bgGradient}
            />
            {showGrid && <GridLayer width={width} height={height} />}
            
            {elements.map((el) => {
              const commonProps = {
                  element: el,
                  isSelected: selectedIds.includes(el.id),
                  onSelect: handleSelect,
                  onChange: handleElementUpdate,
                  showGrid,
                  onRegister: handleRegister,
                  onDragStart: onDragStart,
                  onDragMove: onDragMove,
                  onDragEnd: onDragEnd,
                  onTransformEnd: onTransformEnd,
                  canvasWidth: width
              };
              
              if (el.type === 'image') {
                return <URLImage key={el.id} src={el.src} {...commonProps} />;
              }
              return <EditableText key={el.id} {...commonProps} />;
            })}
            
            <Transformer
              ref={trRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
