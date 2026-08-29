import { CanvasDimensions, ExportFormat } from '../types';

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    window.innerWidth < 768 ||
    navigator.maxTouchPoints > 2
  );
}

export interface ExportProgressCallback {
  (status: string): void;
}

export interface ExportOptions {
  dimensions: CanvasDimensions;
  scaleMultiplier: 1 | 2 | 4;
  format: ExportFormat;
  filename?: string;
  quality?: number;
  onProgress?: ExportProgressCallback;
}

function waitFrame(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
}

async function waitForFonts(): Promise<void> {
  if (!document.fonts) return;
  try {
    await document.fonts.ready;
  } catch {}
}

async function waitForImage(img: HTMLImageElement): Promise<void> {
  try {
    if (!img.complete) {
      await new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      });
    }
    if (typeof img.decode === 'function') {
      try {
        await img.decode();
      } catch {}
    }
  } catch {}
}

async function waitForAllImages(node: HTMLElement): Promise<void> {
  const images = Array.from(node.querySelectorAll('img'));
  await Promise.all(images.map(waitForImage));
}

async function loadSnapdom() {
  const mod = await import('@zumer/snapdom');
  if (!mod.snapdom) {
    throw new Error('SnapDOM failed to load.');
  }
  return mod.snapdom;
}

function getFormatConfig(
  format: ExportFormat | string,
  quality = 0.92
) {
  const normalized = String(format).toLowerCase();
  if (normalized === 'jpg' || normalized === 'jpeg') {
    return { extension: 'jpg', mimeType: 'image/jpeg', formatName: 'jpeg', quality, transparent: false };
  }
  if (normalized === 'webp') {
    return { extension: 'webp', mimeType: 'image/webp', formatName: 'webp', quality, transparent: false };
  }
  if (normalized === 'transparent-png') {
    return { extension: 'png', mimeType: 'image/png', formatName: 'png', transparent: true };
  }
  return { extension: 'png', mimeType: 'image/png', formatName: 'png', transparent: false };
}

export async function exportGraphic(
  node: HTMLElement,
  options: ExportOptions
): Promise<void> {
  const { dimensions, scaleMultiplier, format, onProgress, quality = 0.92 } = options;
  const targetWidth = dimensions.width * scaleMultiplier;
  const targetHeight = dimensions.height * scaleMultiplier;
  
  if (isMobileDevice() && targetWidth * targetHeight > 50_000_000) {
    throw new Error('This 4× export is too large for many mobile browsers.');
  }

  const formatConfig = getFormatConfig(format, quality);

  try {
    onProgress?.(`Preparing ${targetWidth} × ${targetHeight} px export...`);
    
    await waitForFonts();
    await waitForAllImages(node);
    await waitFrame();

    const snapdom = await loadSnapdom();

    onProgress?.(`Rendering ${targetWidth} × ${targetHeight} px...`);

    const result = await snapdom(node, {
      scale: scaleMultiplier,
      dpr: 1,
      reconcile: true,
      embedFonts: true,
      cache: 'full',
      compress: true,
      outerTransforms: true,
      outerShadows: false,
      fast: false,
      exclude: [
        '.editor-guide',
        '.selection-outline',
        '.resize-handle',
        '.drag-handle',
        '.editor-overlay'
      ]
    });
    
    const filename = options.filename || `Graphic_${targetWidth}x${targetHeight}.${formatConfig.extension}`;
    
    onProgress?.('Downloading...');
    
    await result.download({
      format: formatConfig.formatName as 'png' | 'jpeg' | 'webp',
      filename,
      quality: formatConfig.quality
    });

    onProgress?.('Done!');
  } catch (error) {
    console.error('Export failed:', error);
    const message = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Image rendering failed';
    throw new Error(`Export failed: ${message}`);
  }
}

export async function copyGraphicToClipboard(
  node: HTMLElement,
  dimensions: CanvasDimensions
): Promise<boolean> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) {
      throw new Error('Clipboard API is not supported in this browser');
    }
    
    await waitForFonts();
    await waitForAllImages(node);
    await waitFrame();

    const snapdom = await loadSnapdom();

    const result = await snapdom(node, {
      scale: 1,
      dpr: 1,
      reconcile: true,
      embedFonts: true,
      cache: 'full',
      compress: true,
      outerTransforms: true,
      outerShadows: false,
      fast: false,
      exclude: [
        '.editor-guide',
        '.selection-outline',
        '.resize-handle',
        '.drag-handle',
        '.editor-overlay'
      ]
    });
    
    const blob = await result.blob({
      format: 'png',
      quality: 1
    });

    if (!blob) throw new Error('Could not generate image blob');

    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    throw error;
  }
}
