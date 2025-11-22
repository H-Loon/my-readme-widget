/**
 * useEditorState.ts
 * 
 * This custom hook manages the visual configuration of the editor canvas.
 * It holds the state for things like the canvas size, background theme, zoom level, etc.
 * These settings affect how the widget looks but are separate from the individual elements (text/images).
 */
import { useState } from 'react';

export function useEditorState() {
  // The width of the canvas in pixels.
  const [canvasWidth, setCanvasWidth] = useState(1400);
  
  // The height of the canvas in pixels.
  const [canvasHeight, setCanvasHeight] = useState(600);
  
  // The color theme preset (e.g., 'blue', 'dark', 'transparent').
  const [theme, setTheme] = useState('transparent');
  
  // The background style (e.g., 'solid', 'ethereal' blobs).
  const [style, setStyle] = useState('transparent');
  
  // Number of animated blobs to show if style is 'ethereal'.
  const [blobCount, setBlobCount] = useState(5);
  
  // Custom start color for the background gradient.
  const [customFrom, setCustomFrom] = useState('#6366f1');
  
  // Custom end color for the background gradient.
  const [customTo, setCustomTo] = useState('#ec4899');
  
  // URL for a custom background image.
  const [bgImage, setBgImage] = useState('');
  
  // How the background image should fit (cover or contain).
  const [bgFit, setBgFit] = useState<'cover' | 'contain'>('cover');
  
  // Whether to show the alignment grid on the canvas.
  const [showGrid, setShowGrid] = useState(true);
  
  // The current zoom level of the editor (1 = 100%).
  const [zoom, setZoom] = useState(1);

  // Return all state variables and their setters.
  return {
    canvasWidth, setCanvasWidth,
    canvasHeight, setCanvasHeight,
    theme, setTheme,
    style, setStyle,
    blobCount, setBlobCount,
    customFrom, setCustomFrom,
    customTo, setCustomTo,
    bgImage, setBgImage,
    bgFit, setBgFit,
    showGrid, setShowGrid,
    zoom, setZoom
  };
}
