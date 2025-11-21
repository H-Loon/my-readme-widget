export interface GradientStop {
  offset: number;
  color: string;
}

export interface CanvasElement {
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
  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  letterSpacing?: number;
  neon?: {
    enabled: boolean;
    color: string;
    intensity: number;
    propagation?: number;
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

export interface WidgetData {
  id?: string;
  uid: string;
  createdAt: any;
  name: string;
  elements: CanvasElement[];
  width: number;
  height: number;
  theme: string;
  style: string;
  blobCount: number;
  customFrom: string;
  customTo: string;
  bgImage: string;
  bgFit: 'cover' | 'contain';
  dirty?: boolean;
}
