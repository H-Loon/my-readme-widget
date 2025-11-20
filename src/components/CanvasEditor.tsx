import React, { useEffect, useRef } from 'react';
import { Stage, Layer, Text, Image as KonvaImage, Transformer, Group, Rect, Line } from 'react-konva';
import useImage from 'use-image';

const GRID_SIZE = 20;

interface GradientStop {
  offset: number;
  color: string;
}

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

interface CanvasEditorProps {
  width: number;
  height: number;
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (newElements: CanvasElement[]) => void;
  bgImage?: string;
  bgFit?: 'cover' | 'contain' | 'stretch';
  theme?: string;
  customFrom?: string;
  customTo?: string;
  blobCount?: number;
  showGrid?: boolean;
}

const URLImage = ({ src, element, isSelected, onSelect, onChange, showGrid }: any) => {
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

  const [image] = useImage(imageSrc, 'anonymous');
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        image={image}
        ref={shapeRef}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation || 0}
        draggable
        dragBoundFunc={(pos) => {
            if (!showGrid) return pos;
            return {
                x: Math.round(pos.x / GRID_SIZE) * GRID_SIZE,
                y: Math.round(pos.y / GRID_SIZE) * GRID_SIZE
            };
        }}
        onClick={() => onSelect(element.id)}
        onTap={() => onSelect(element.id)}
        onDragEnd={(e) => {
          onChange({
            ...element,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // reset scale to 1 and adjust width/height
          node.scaleX(1);
          node.scaleY(1);
          
          onChange({
            ...element,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const EditableText = ({ element, isSelected, onSelect, onChange, showGrid }: any) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

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
                 });
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
      const r = Math.sqrt(w*w + h*h) / 2;
      
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
      shadowColor: element.shadowColor || 'transparent',
      shadowBlur: element.shadowBlur || 0,
      shadowOffsetX: element.shadowOffsetX || 0,
      shadowOffsetY: element.shadowOffsetY || 0,
      shadowOpacity: 1
  };

  if (element.neon?.enabled) {
      shadowProps = {
          shadowColor: element.neon.color,
          shadowBlur: element.neon.intensity,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowOpacity: 1
      };
  }

  return (
    <>
      <Text
        ref={shapeRef}
        text={element.text}
        x={element.x}
        y={element.y}
        fontSize={element.size}
        fontFamily={element.fontFamily}
        fontStyle={`${element.bold ? 'bold' : ''} ${element.italic ? 'italic' : ''}`.trim() || 'normal'}
        textDecoration={element.underline ? 'underline' : ''}
        {...fillProps}
        {...shadowProps}
        draggable
        dragBoundFunc={(pos) => {
            if (!showGrid) return pos;
            return {
                x: Math.round(pos.x / GRID_SIZE) * GRID_SIZE,
                y: Math.round(pos.y / GRID_SIZE) * GRID_SIZE
            };
        }}
        rotation={element.rotation || 0}
        onClick={() => onSelect(element.id)}
        onTap={() => onSelect(element.id)}
        onDragEnd={(e) => {
          onChange({
            ...element,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...element,
            x: node.x(),
            y: node.y(),
            size: Math.round(element.size * scaleX),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const BackgroundLayer = ({ width, height, bgImage, bgFit, theme, customFrom, customTo, blobCount }: any) => {
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

const GridLayer = ({ width, height }: { width: number; height: number }) => {
    const lines = [];
    // Vertical lines
    for (let i = 0; i <= width; i += GRID_SIZE) {
        lines.push(
            <Line
                key={`v-${i}`}
                points={[i, 0, i, height]}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={1}
            />
        );
    }
    // Horizontal lines
    for (let i = 0; i <= height; i += GRID_SIZE) {
        lines.push(
            <Line
                key={`h-${i}`}
                points={[0, i, width, i]}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={1}
            />
        );
    }
    return <Group>{lines}</Group>;
};

export default function CanvasEditor({ width, height, elements, selectedId, onSelect, onChange, bgImage, bgFit, theme, customFrom, customTo, blobCount, showGrid }: CanvasEditorProps) {
  
  const handleElementChange = (newAttrs: any) => {
    const newElements = elements.map(el => {
      if (el.id === newAttrs.id) {
        return newAttrs;
      }
      return el;
    });
    onChange(newElements);
  };

  const checkDeselect = (e: any) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      onSelect(null);
    }
  };

  return (
    <div className="shadow-2xl overflow-hidden bg-[url('https://res.cloudinary.com/practicaldev/image/fetch/s--_MCEk7P6--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/i/1wwdyw5de8avrdkgtz5n.png')] bg-repeat" style={{ width, height }}>
      <Stage width={width} height={height} onMouseDown={checkDeselect} onTouchStart={checkDeselect}>
        <Layer>
            <BackgroundLayer 
                width={width} 
                height={height} 
                bgImage={bgImage} 
                bgFit={bgFit}
                theme={theme} 
                customFrom={customFrom} 
                customTo={customTo} 
                blobCount={blobCount}
            />
            {showGrid && <GridLayer width={width} height={height} />}
        </Layer>
        <Layer>
          {elements.map((el) => {
            if (el.type === 'image') {
              return (
                <URLImage
                  key={el.id}
                  src={el.src}
                  element={el}
                  isSelected={el.id === selectedId}
                  onSelect={onSelect}
                  onChange={handleElementChange}
                  showGrid={showGrid}
                />
              );
            }
            return (
              <EditableText
                key={el.id}
                element={el}
                isSelected={el.id === selectedId}
                onSelect={onSelect}
                onChange={handleElementChange}
                showGrid={showGrid}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
