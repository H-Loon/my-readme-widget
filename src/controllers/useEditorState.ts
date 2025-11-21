/**
 * useEditorState Hook
 * 
 * Manages the visual state of the editor canvas.
 * This includes dimensions, themes, background styles, zoom level, and grid visibility.
 * It provides a centralized store for all UI-related configuration that doesn't
 * directly affect the content elements themselves.
 */
import { useState } from 'react';

export function useEditorState() {
  const [canvasWidth, setCanvasWidth] = useState(1400);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [theme, setTheme] = useState('transparent');
  const [style, setStyle] = useState('transparent');
  const [blobCount, setBlobCount] = useState(5);
  const [customFrom, setCustomFrom] = useState('#6366f1');
  const [customTo, setCustomTo] = useState('#ec4899');
  const [bgImage, setBgImage] = useState('');
  const [bgFit, setBgFit] = useState<'cover' | 'contain'>('cover');
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);

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
