/**
 * types.ts
 * 
 * This file defines the TypeScript interfaces (shapes of objects) used throughout the application.
 * It acts as the "contract" for data structures, ensuring that the Model, View, and Controller
 * all agree on what a "Widget" or an "Element" looks like.
 */

/**
 * Represents a single color stop in a gradient.
 * Used for creating smooth color transitions.
 */
export interface GradientStop {
  /** The position of the color stop (0 to 1). 0 is the start, 1 is the end. */
  offset: number;
  /** The color value (e.g., "#ff0000" or "red"). */
  color: string;
}

/**
 * Represents a single element on the canvas (like a text box or an image).
 * This is the core building block of a widget.
 */
export interface CanvasElement {
  /** Unique identifier for this element. */
  id: string;
  /** The type of element: either text or an image. */
  type: 'text' | 'image';
  /** The X coordinate (horizontal position) on the canvas. */
  x: number;
  /** The Y coordinate (vertical position) on the canvas. */
  y: number;
  
  // --- Text Specific Properties ---
  /** The actual text content to display. */
  text?: string;
  /** The color of the text. */
  color?: string;
  /** The font size in pixels. */
  size?: number;
  /** Whether the text is bold. */
  bold?: boolean;
  /** Whether the text is italicized. */
  italic?: boolean;
  /** Whether the text is underlined. */
  underline?: boolean;
  /** Text alignment: left (start), center (middle), or right (end). */
  align?: 'start' | 'middle' | 'end';
  /** The font family to use (e.g., "Arial", "Roboto"). */
  fontFamily?: string;
  
  // --- Shadow Properties ---
  /** Whether a drop shadow is enabled for this element. */
  shadowEnabled?: boolean;
  /** The color of the shadow. */
  shadowColor?: string;
  /** How blurry the shadow is. Higher numbers mean more blur. */
  shadowBlur?: number;
  /** Horizontal distance of the shadow from the element. */
  shadowOffsetX?: number;
  /** Vertical distance of the shadow from the element. */
  shadowOffsetY?: number;
  /** Spacing between characters in pixels. */
  letterSpacing?: number;

  // --- Neon Effect Properties ---
  /** Configuration for the neon glow effect. */
  neon?: {
    /** Whether the neon effect is turned on. */
    enabled: boolean;
    /** The color of the neon glow. */
    color: string;
    /** How intense/bright the glow is. */
    intensity: number;
    /** How far the glow spreads (propagation). */
    propagation?: number;
    /** The width of the neon stroke. */
    strokeWidth?: number;
  };

  // --- Gradient Fill Properties ---
  /** Configuration for gradient text fill. */
  gradient?: {
    /** Whether the gradient fill is turned on. */
    enabled: boolean;
    /** The type of gradient (currently only linear is supported). */
    type: 'linear';
    /** The angle of the gradient in degrees. */
    angle: number;
    /** The list of colors and their positions in the gradient. */
    stops: GradientStop[];
  };

  // --- Image Specific Properties ---
  /** The source URL of the image. */
  src?: string;
  /** The width of the image. */
  width?: number;
  /** The height of the image. */
  height?: number;
  /** The scale factor (1 = 100%). */
  scale?: number;
  /** Rotation angle in degrees. */
  rotation?: number;
  /** How the image should fit within its bounds (like CSS object-fit). */
  fit?: 'contain' | 'cover' | 'stretch';
}

/**
 * Represents the entire Widget document as stored in the database.
 * Contains all settings and the list of elements.
 */
export interface WidgetData {
  /** The database ID of the widget (optional because new widgets don't have one yet). */
  id?: string;
  /** The User ID of the owner (who created this widget). */
  uid: string;
  /** Timestamp of when the widget was created. */
  createdAt: any;
  /** The display name of the widget. */
  name: string;
  /** The list of elements (text, images) on the widget. */
  elements: CanvasElement[];
  /** The width of the entire canvas. */
  width: number;
  /** The height of the entire canvas. */
  height: number;
  /** The color theme preset name (e.g., "blue", "dark"). */
  theme: string;
  /** The background style (e.g., "solid", "ethereal"). */
  style: string;
  /** Number of background blobs (if style is ethereal). */
  blobCount: number;
  /** Custom start color for background gradient. */
  customFrom: string;
  /** Custom end color for background gradient. */
  customTo: string;
  /** URL for a custom background image. */
  bgImage: string;
  /** How the background image fits. */
  bgFit: 'cover' | 'contain';
  /** Flag to indicate if there are unsaved changes. */
  dirty?: boolean;
}
