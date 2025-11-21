import { CanvasElement } from '@/models/types';

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
  origin: string;
  forcePreview?: boolean;
}

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
  origin,
  forcePreview = false
}: GetApiUrlProps) => {
  if (savedId && !forcePreview && !savedId.startsWith('temp_')) {
    return `${origin}/api/badge?id=${savedId}`;
  }
  const minifiedElements = elements.map(({ id, scale, ...rest }) => rest);
  const jsonString = JSON.stringify(minifiedElements);
  let url = `${origin}/api/badge?data=${encodeURIComponent(jsonString)}&h=${canvasHeight}&w=${canvasWidth}&theme=${theme}&style=${style}`;
  if (style === 'ethereal') url += `&blobs=${blobCount}`;
  if (theme === 'custom') url += `&from=${encodeURIComponent(customFrom)}&to=${encodeURIComponent(customTo)}`;
  if (bgImage) url += `&bg=${encodeURIComponent(bgImage)}&bgFit=${bgFit}`;
  return url;
};
