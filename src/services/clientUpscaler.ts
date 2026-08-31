function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    if (/^https?:/i.test(src)) {
      image.crossOrigin = 'anonymous';
      image.referrerPolicy = 'no-referrer';
    }
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Selected image could not be loaded for enhancement.'));
    image.src = src;
  });
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

function drawHighQuality(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = makeCanvas(width, height);
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) throw new Error('Canvas enhancement is not supported by this browser.');
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(source, 0, 0, sourceWidth, sourceHeight, 0, 0, width, height);
  return canvas;
}

function subtleSharpen(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const width = canvas.width;
  const height = canvas.height;
  // Avoid an expensive full-resolution convolution on very large images.
  // High-quality resampling alone is safer above this threshold.
  if (width * height > 9_000_000) return canvas;

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return canvas;

  try {
    const image = context.getImageData(0, 0, width, height);
    const source = new Uint8ClampedArray(image.data);
    const data = image.data;
    const strength = 0.16;
    const stride = width * 4;

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = (y * width + x) * 4;
        for (let channel = 0; channel < 3; channel += 1) {
          const center = source[index + channel];
          const neighbours =
            source[index - 4 + channel] +
            source[index + 4 + channel] +
            source[index - stride + channel] +
            source[index + stride + channel];
          const sharpened = center + strength * (4 * center - neighbours);
          data[index + channel] = Math.max(0, Math.min(255, Math.round(sharpened)));
        }
      }
    }
    context.putImageData(image, 0, 0);
  } catch (error) {
    console.warn('Sharpen pass skipped.', error);
  }
  return canvas;
}

export async function upscaleImage2x(imageSrc: string): Promise<string> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Image enhancement is available only in the browser.');
  }
  if (!imageSrc) throw new Error('No image is selected for enhancement.');

  const image = await loadImage(imageSrc);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) throw new Error('Selected image has invalid dimensions.');

  const targetWidth = sourceWidth * 2;
  const targetHeight = sourceHeight * 2;
  const maxDimension = 8192;
  const scaleLimit = Math.min(1, maxDimension / Math.max(targetWidth, targetHeight));
  const finalWidth = Math.max(sourceWidth, Math.round(targetWidth * scaleLimit));
  const finalHeight = Math.max(sourceHeight, Math.round(targetHeight * scaleLimit));

  // Two-stage resampling tends to preserve edges better than one very large jump,
  // while remaining completely local, free and deterministic.
  const midScale = Math.min(1.5, finalWidth / sourceWidth);
  const midWidth = Math.max(sourceWidth, Math.round(sourceWidth * midScale));
  const midHeight = Math.max(sourceHeight, Math.round(sourceHeight * midScale));
  const mid = drawHighQuality(image, sourceWidth, sourceHeight, midWidth, midHeight);
  const output = drawHighQuality(mid, midWidth, midHeight, finalWidth, finalHeight);
  subtleSharpen(output);

  try {
    return output.toDataURL('image/png', 1);
  } catch {
    throw new Error('The image could not be exported after enhancement. Try uploading it from your device instead of using a remote URL.');
  }
}
