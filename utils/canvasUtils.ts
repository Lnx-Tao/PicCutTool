import { PixelCrop, OutputFormat } from '../types';

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

/**
 * Crops and resizes the image based on the pixel crop area and target dimensions.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  targetWidth: number,
  targetHeight: number,
  mimeType: OutputFormat = 'image/jpeg'
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to the final desired output size
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Handle transparent background for JPEGs (fill with white)
  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Draw the cropped area of the source image onto the canvas, scaling it to fit
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return canvas.toDataURL(mimeType, 0.92);
}

/**
 * Splits an image into a grid of blobs.
 */
export async function splitImageToGrid(
  imageSrc: string,
  rows: number,
  cols: number,
  mimeType: OutputFormat = 'image/jpeg'
): Promise<{ blob: Blob; filename: string }[]> {
  const image = await createImage(imageSrc);
  const totalWidth = image.width;
  const totalHeight = image.height;
  
  const chunkWidth = totalWidth / cols;
  const chunkHeight = totalHeight / rows;
  const extension = mimeType === 'image/jpeg' ? 'jpg' : 'png';

  const promises: Promise<{ blob: Blob; filename: string }>[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      promises.push(
        new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No 2d context'));
            return;
          }

          canvas.width = chunkWidth;
          canvas.height = chunkHeight;

          if (mimeType === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, chunkWidth, chunkHeight);
          }

          ctx.drawImage(
            image,
            c * chunkWidth, // Source X
            r * chunkHeight, // Source Y
            chunkWidth, // Source Width
            chunkHeight, // Source Height
            0,
            0,
            chunkWidth,
            chunkHeight
          );

          canvas.toBlob((blob) => {
            if (blob) {
              // 1-based indexing for filename
              resolve({ 
                blob, 
                filename: `row${r + 1}_col${c + 1}.${extension}` 
              });
            } else {
              reject(new Error('Canvas is empty'));
            }
          }, mimeType, 0.92);
        })
      );
    }
  }

  return Promise.all(promises);
}