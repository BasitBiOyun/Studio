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

function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => resolve());
    else setTimeout(resolve, 0);
  });
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

  // Keep this completely local and free, but avoid full-resolution pixel loops on
  // the main thread. Two high-quality resampling passes give a useful 2x source
  // for graphic work without freezing the Studio on ordinary laptops.
  const midScale = Math.min(1.5, finalWidth / sourceWidth);
  const midWidth = Math.max(sourceWidth, Math.round(sourceWidth * midScale));
  const midHeight = Math.max(sourceHeight, Math.round(sourceHeight * midScale));
  const mid = drawHighQuality(image, sourceWidth, sourceHeight, midWidth, midHeight);
  await yieldToBrowser();
  const output = drawHighQuality(mid, midWidth, midHeight, finalWidth, finalHeight);
  await yieldToBrowser();

  try {
    return output.toDataURL('image/png', 1);
  } catch {
    throw new Error('The image could not be exported after enhancement. Try uploading it from your device instead of using a remote URL.');
  }
}
