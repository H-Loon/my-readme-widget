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
const EditableText = ({ element, isSelected, onSelect, onChange, showGrid, onRegister, onDragStart, onDragMove, onDragEnd, onTransformEnd }: any) => {
  const shapeRef = useRef<any>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  useEffect(() => {
    if (shapeRef.current) {
      onRegister(element.id, shapeRef.current);
    }
  }, [element.id, onRegister]);

  // Measure text dimensions when properties change
  useEffect(() => {
    if (shapeRef.current) {
      const w = shapeRef.current.width();
      const h = shapeRef.current.height();

      setDimensions({ width: w, height: h });

      // Sync dimensions to parent state for SVG generation
      if (Math.abs(w - (element.width || 0)) > 1 || Math.abs(h - (element.height || 0)) > 1) {
        // Use a timeout to avoid render cycle warnings or conflicts
        setTimeout(() => {
          onChange({
            ...element,
            width: w,
            height: h
          }, false);
        }, 0);
      }
    }
  }, [element.text, element.size, element.fontFamily, element.bold, element.italic, element.width, element.height]);

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
      strokeWidth: 2
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
  let offsetX = 0;
  if (element.align === 'middle') {
    offsetX = currentWidth / 2;
  } else if (element.align === 'end') {
    offsetX = currentWidth;
  }

  return (
    <Text
      ref={shapeRef}
      text={element.text}
      x={element.x}
      y={element.y}
      offsetX={offsetX}
      align={element.align === 'middle' ? 'center' : element.align === 'end' ? 'right' : 'left'}
      fontSize={element.size}
      fontFamily={element.fontFamily}
      fontStyle={`${element.bold ? 'bold' : ''} ${element.italic ? 'italic' : ''}`.trim() || 'normal'}
      textDecoration={element.underline ? 'underline' : ''}
      letterSpacing={element.letterSpacing || 0}
      {...fillProps}
      {...shadowProps}
      {...strokeProps}
      draggable
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
      rotation={element.rotation || 0}
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
 * BackgroundLayer Component
 * Renders the background image or color.
 * Handles different fit modes (cover, contain, stretch).
 */
const BackgroundLayer = ({ width, height, bgImage, bgFit, theme, customFrom, customTo, blobCount, style }: any) => {
  const [image] = useImage(bgImage || '', 'anonymous');

  if (bgImage && image) {
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
  if (style === 'transparent' || theme === 'transparent') {
    return null;
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
export default function CanvasEditor({ width, height, elements, selectedIds, onSelect, onChange, bgImage, bgFit, theme, customFrom, customTo, blobCount, showGrid, style }: CanvasEditorProps) {
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

  return (
    <div className="shadow-2xl overflow-hidden bg-[url('https://res.cloudinary.com/practicaldev/image/fetch/s--_MCEk7P6--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/i/1wwdyw5de8avrdkgtz5n.png')] bg-repeat" style={{ width, height }}>
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
                onTransformEnd: onTransformEnd
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
  );
}
