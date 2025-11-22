/**
 * canvasHelpers.ts
 * 
 * This file contains utility functions related to the canvas and URL generation.
 * It helps keep the main component logic clean by moving complex URL construction logic here.
 */
import { CanvasElement } from '@/models/types';

/**
 * Props required to generate the API URL.
 */
interface GetApiUrlProps {
  savedId: string | null;
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  theme: string;
  style: string;
  blobCount: number;
  customFrom: string;
  customTo: string;
  bgImage: string;
  bgFit: string;
  bgColor: string;
  blobColor?: string;
  bgGradient: any;
  origin: string;
  forcePreview?: boolean;
}

/**
 * Generates the URL for the badge image.
 * 
 * There are two modes:
 * 1. **Saved Widget Mode**: If the widget is saved (has an ID), the URL is short: `/api/badge?id=...`
 * 2. **Preview/Unsaved Mode**: If not saved, ALL the widget data is encoded into the URL itself.
 *    This allows for instant previews without saving to the database.
 * 
 * @param props - The configuration of the widget.
 * @returns The full URL to the badge image.
 */
export const getApiUrl = ({
  savedId,
  elements,
  canvasWidth,
  canvasHeight,
  theme,
  style,
  blobCount,
  customFrom,
  customTo,
  bgImage,
  bgFit,
  bgColor,
  blobColor,
  bgGradient,
  origin,
  forcePreview = false
}: GetApiUrlProps) => {
  // Mode 1: If we have a saved ID and we aren't forcing a preview, use the short ID-based URL.
  // We also check that the ID isn't a temporary one (starting with 'temp_').
  if (savedId && !forcePreview && !savedId.startsWith('temp_')) {
    return `${origin}/api/badge?id=${savedId}`;
  }

  // Mode 2: Encode all data into the URL.
  
  // First, remove unnecessary properties from elements to save space in the URL.
  // We remove 'id' and 'scale' as they might not be needed for the static render.
  const minifiedElements = elements.map(({ id, scale, ...rest }) => rest);
  
  // Convert the elements array to a JSON string.
  const jsonString = JSON.stringify(minifiedElements);
  
  // Start building the URL with the base parameters.
  // encodeURIComponent is crucial to make sure special characters don't break the URL.
  let url = `${origin}/api/badge?data=${encodeURIComponent(jsonString)}&h=${canvasHeight}&w=${canvasWidth}&theme=${theme}&style=${style}`;
  
  // Append optional parameters based on the style and theme.
  if (style === 'ethereal') url += `&blobs=${blobCount}`;
  if (theme === 'custom') url += `&from=${encodeURIComponent(customFrom)}&to=${encodeURIComponent(customTo)}`;
  if (bgImage) url += `&bg=${encodeURIComponent(bgImage)}&bgFit=${bgFit}`;
  
  // Append new background properties
  if (bgColor) url += `&bgColor=${encodeURIComponent(bgColor)}`;
  if (blobColor) url += `&blobColor=${encodeURIComponent(blobColor)}`;
  if (bgGradient && bgGradient.enabled) {
    url += `&bgGradient=${encodeURIComponent(JSON.stringify(bgGradient))}`;
  }
  
  return url;
};
