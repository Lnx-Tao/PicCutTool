export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridConfig {
  rows: number;
  cols: number;
}

export interface ProcessingState {
  originalImageSrc: string | null;
  processedImageSrc: string | null; // The result after cropping/resizing
  targetWidth: number;
  targetHeight: number;
  filenamePrefix: string;
}

export enum Step {
  UPLOAD = 0,
  CROP_RESIZE = 1,
  GRID_SPLIT = 2
}

export type OutputFormat = 'image/png' | 'image/jpeg';