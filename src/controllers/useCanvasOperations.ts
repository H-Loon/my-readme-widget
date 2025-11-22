/**
 * useCanvasOperations.ts
 * 
 * This hook contains the logic for manipulating elements on the canvas.
 * It handles adding, updating, deleting, and resizing elements.
 * It keeps the main view component clean by abstracting these operations.
 */
import { CanvasElement } from '@/models/types';
import { loadWebFont } from '@/utils/fontUtils';

interface UseCanvasOperationsProps {
  elements: CanvasElement[];
  handleElementsChange: (newElements: CanvasElement[], saveHistory?: boolean) => void;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  canvasWidth: number;
  canvasHeight: number;
  setCanvasHeight: (h: number) => void;
}

export function useCanvasOperations({
  elements,
  handleElementsChange,
  selectedIds,
  setSelectedIds,
  canvasWidth,
  canvasHeight,
  setCanvasHeight
}: UseCanvasOperationsProps) {

  /**
   * Helper function to load an image and determine its natural dimensions.
   * It ensures the image fits within a reasonable size (max 250px width) initially.
   */
  const resolveImageDimensions = (src: string, id: string, currentElements: CanvasElement[]) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 250;
      const ratio = img.width / img.height;
      let newW = img.width;
      let newH = img.height;

      // Scale down if too big
      if (newW > maxW) {
        newW = maxW;
        newH = maxW / ratio;
      }

      // Update the element with the correct dimensions
      const newElements = currentElements.map(el => {
        if (el.id === id) {
          return {
            ...el,
            width: Math.round(newW),
            height: Math.round(newH),
            scale: 1.0
          };
        }
        return el;
      });
      handleElementsChange(newElements);
    };
    img.src = src;
  };

  /**
   * Adds a new text element to the center of the canvas.
   */
  const addText = () => {
    const newId = Date.now().toString();
    const newElements: CanvasElement[] = [...elements, {
      id: newId,
      type: 'text',
      text: "New Text",
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      color: '#334155',
      size: 32,
      bold: false,
      italic: false,
      underline: false,
      align: 'middle',
      fontFamily: 'sans-serif',
      shadowEnabled: false,
      shadowColor: '#000000',
      shadowBlur: 0,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      gradient: { enabled: false, type: 'linear', angle: 90, stops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#ec4899' }] },
      neon: { enabled: false, color: '#00ff00', intensity: 20 }
    }];
    handleElementsChange(newElements);
    setSelectedIds([newId]);
  };

  /**
   * Adds a new image element to the canvas.
   * Uses a default placeholder image initially.
   */
  const addImage = () => {
    const newId = Date.now().toString();
    const startX = (canvasWidth / 2) - 60;
    const startY = (canvasHeight / 2) + 60;
    const defaultSrc = "https://img.shields.io/badge/Badge-Example-blue";

    const newElements: CanvasElement[] = [...elements, { id: newId, type: 'image', src: defaultSrc, x: startX, y: startY, width: 100, height: 100, scale: 1.0, fit: 'contain' }];
    handleElementsChange(newElements);
    setSelectedIds([newId]);
    
    // Calculate real dimensions after adding
    resolveImageDimensions(defaultSrc, newId, newElements);
  };

  /**
   * Updates a specific property of the currently selected element(s).
   * 
   * @param key - The property name to update (e.g., 'color', 'x', 'text').
   * @param value - The new value for the property.
   */
  const updateSelected = (key: keyof CanvasElement, value: any) => {
    let finalValue = value;
    
    // Special handling for Image Source updates
    if (key === 'src' && typeof value === 'string') {
      // 1. Handle Markdown image syntax: ![alt](url)
      const mdMatch = value.match(/!\[.*?\]\((.*?)\)/);
      if (mdMatch && mdMatch[1]) {
        finalValue = mdMatch[1];
      }

      // 2. Handle GitHub Readme Stats URLs to ensure animations are disabled
      if (finalValue.includes('github-readme-stats.vercel.app') && !finalValue.includes('disable_animations')) {
        finalValue += finalValue.includes('?') ? '&disable_animations=true' : '?disable_animations=true';
      }
    }

    // If changing font, load it dynamically.
    if (key === 'fontFamily') {
      loadWebFont(value);
    }

    // Apply the change to all selected elements.
    const newElements = elements.map(el => selectedIds.includes(el.id) ? { ...el, [key]: finalValue } : el);
    handleElementsChange(newElements);
    
    // If image source changed, recalculate dimensions.
    if (key === 'src') {
      selectedIds.forEach(id => resolveImageDimensions(finalValue, id, newElements));
    }
  };

  /**
   * Deletes the currently selected element(s).
   */
  const deleteSelected = () => {
    const newElements = elements.filter(el => !selectedIds.includes(el.id));
    handleElementsChange(newElements);
    setSelectedIds([]);
  };

  /**
   * Resizes the selected image to match the canvas width.
   */
  const fitToWidth = () => {
    const newElements = elements.map(el => {
      if (selectedIds.includes(el.id) && el.type === 'image') {
        const newWidth = canvasWidth;
        const ratio = newWidth / (el.width || 1);
        const newHeight = Math.round((el.height || 1) * ratio);
        const newScale = (el.scale || 1) * ratio;
        return {
          ...el,
          width: newWidth,
          height: newHeight,
          scale: newScale,
          x: 0
        };
      }
      return el;
    });
    handleElementsChange(newElements);
  };

  /**
   * Resizes the selected image to match the canvas height.
   */
  const fitToHeight = () => {
    const newElements = elements.map(el => {
      if (selectedIds.includes(el.id) && el.type === 'image') {
        const newHeight = canvasHeight;
        const ratio = newHeight / (el.height || 1);
        const newWidth = Math.round((el.width || 1) * ratio);
        const newScale = (el.scale || 1) * ratio;
        return {
          ...el,
          width: newWidth,
          height: newHeight,
          scale: newScale,
          y: 0
        };
      }
      return el;
    });
    handleElementsChange(newElements);
  };

  /**
   * Changes the text alignment (start, middle, end) and adjusts the X position
   * so the text visually stays in the same place.
   */
  const handleAlignChange = (newAlign: 'start' | 'middle' | 'end') => {
    if (selectedIds.length === 0) return;

    const newElements = elements.map(el => {
      if (selectedIds.includes(el.id) && el.type === 'text') {
        const width = el.width || (el.text?.length || 0) * (el.size || 16) * 0.6;
        const oldAlign = el.align || 'start';

        if (oldAlign === newAlign) return el;

        // Calculate where the left edge of the text currently is.
        let visualLeft = el.x;
        if (oldAlign === 'middle') visualLeft = el.x - width / 2;
        if (oldAlign === 'end') visualLeft = el.x - width;

        // Calculate the new anchor point based on the new alignment.
        let newX = visualLeft;
        if (newAlign === 'middle') newX = visualLeft + width / 2;
        if (newAlign === 'end') newX = visualLeft + width;

        return { ...el, align: newAlign, x: newX };
      }
      return el;
    });
    handleElementsChange(newElements);
  };

  /**
   * Adjusts the canvas height to fit the lowest element.
   */
  const fitCanvasToContent = () => {
    if (elements.length > 0) {
      const lowestY = Math.max(...elements.map(e => e.y + (e.type === 'image' ? (e.height || 0) / 2 : 0)));
      setCanvasHeight(Math.max(600, Math.round(lowestY + 150)));
    }
  };

  return {
    addText,
    addImage,
    updateSelected,
    deleteSelected,
    fitToWidth,
    fitToHeight,
    handleAlignChange,
    fitCanvasToContent
  };
}
