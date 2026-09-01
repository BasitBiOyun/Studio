import { CanvasDimensions, ExportFormat } from '../types';

const TURKISH_GLYPH_SAMPLE = 'ÇĞİÖŞÜçğıöşü';
const FONT_STYLESHEET_DOMAINS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

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

async function waitForFonts(node?: HTMLElement): Promise<void> {
  if (!document.fonts) return;
  try {
    await document.fonts.ready;
    if (!node) return;

    const descriptors = new Set<string>();
    const elements: HTMLElement[] = [node, ...Array.from(node.querySelectorAll<HTMLElement>('*'))];
    for (const element of elements) {
      const style = window.getComputedStyle(element);
      if (!style.fontFamily) continue;
      descriptors.add(`${style.fontStyle || 'normal'} ${style.fontWeight || '400'} 32px ${style.fontFamily}`);
    }

    await Promise.all(
      Array.from(descriptors).map(async (descriptor) => {
        try {
          await document.fonts.load(descriptor, TURKISH_GLYPH_SAMPLE);
        } catch {}
      }),
    );
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

function downloadBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function snapOptions(
  scaleMultiplier: 1 | 2 | 4,
  formatName: 'png' | 'jpeg' | 'webp',
  quality: number,
) {
  return {
    type: formatName,
    format: formatName,
    quality,
    scale: scaleMultiplier,
    dpr: 1,
    reconcile: true,
    embedFonts: true,
    fontStylesheetDomains: FONT_STYLESHEET_DOMAINS,
    cache: 'full' as const,
    compress: true,
    outerTransforms: true,
    outerShadows: false,
    fast: true,
    exclude: [
      '.editor-guide',
      '.selection-outline',
      '.resize-handle',
      '.drag-handle',
      '.editor-overlay'
    ]
  };
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
    
    await waitForFonts(node);
    await waitForAllImages(node);
    await waitFrame();

    const snapdom = await loadSnapdom();
    onProgress?.(`Rendering ${targetWidth} × ${targetHeight} px...`);

    const blob = await snapdom.toBlob(
      node,
      snapOptions(
        scaleMultiplier,
        formatConfig.formatName as 'png' | 'jpeg' | 'webp',
        formatConfig.quality,
      ) as any,
    );
    if (!blob) throw new Error('Could not generate image blob');

    const filename = options.filename || `Graphic_${targetWidth}x${targetHeight}.${formatConfig.extension}`;
    onProgress?.('Downloading...');
    downloadBlob(blob, filename);
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
    
    await waitForFonts(node);
    await waitForAllImages(node);
    await waitFrame();

    const snapdom = await loadSnapdom();
    const blob = await snapdom.toBlob(
      node,
      snapOptions(1, 'png', 1) as any,
    );

    if (!blob) throw new Error('Could not generate image blob');

    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    throw error;
  }
}
