export interface SmartTextFitOptions {
  text: string;
  preferredPx: number;
  minPx: number;
  maxPx?: number;
  maxLines: number;
  charsPerLineAtPreferred: number;
  containerHeightPx?: number;
  lineHeight?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function textUnits(value: string): number {
  return Array.from(value).reduce((sum, char) => {
    if (/\s/u.test(char)) return sum + 0.45;
    if (/[MW@#%&]/u.test(char)) return sum + 1.25;
    if (/[ilIıİ1.,:;!'|]/u.test(char)) return sum + 0.55;
    return sum + 1;
  }, 0);
}

export function estimateWrappedLineCount(text: string, capacity: number): number {
  const normalized = String(text || '').trim();
  if (!normalized) return 1;

  const safeCapacity = Math.max(4, capacity);
  let lines = 0;

  for (const paragraph of normalized.split(/\n/u)) {
    const words = paragraph.trim().split(/\s+/u).filter(Boolean);
    if (!words.length) {
      lines += 1;
      continue;
    }

    let current = 0;
    for (const word of words) {
      const units = textUnits(word);
      if (units > safeCapacity) {
        if (current > 0) {
          lines += 1;
          current = 0;
        }
        const fullLines = Math.floor(units / safeCapacity);
        lines += fullLines;
        current = units - fullLines * safeCapacity;
        if (current < 0.01) current = 0;
        continue;
      }

      const separator = current > 0 ? 0.45 : 0;
      if (current + separator + units <= safeCapacity) {
        current += separator + units;
      } else {
        lines += 1;
        current = units;
      }
    }
    if (current > 0) lines += 1;
  }

  return Math.max(1, lines);
}

export function fitTextFontSizePx(options: SmartTextFitOptions): number {
  const preferred = Math.max(1, Number(options.preferredPx) || 1);
  const minPx = Math.max(1, Number(options.minPx) || 1);
  const maxPx = Math.max(minPx, Number(options.maxPx ?? preferred) || preferred);
  const startPx = clamp(preferred, minPx, maxPx);
  const maxLines = Math.max(1, Math.floor(options.maxLines || 1));
  const baseCapacity = Math.max(4, Number(options.charsPerLineAtPreferred) || 4);
  const lineHeight = Math.max(0.7, Number(options.lineHeight ?? 1.05) || 1.05);
  const containerHeight = options.containerHeightPx == null
    ? undefined
    : Math.max(1, Number(options.containerHeightPx) || 1);

  for (let px = startPx; px >= minPx; px -= 1) {
    const capacity = baseCapacity * (preferred / px);
    const lines = estimateWrappedLineCount(options.text, capacity);
    const fitsLines = lines <= maxLines;
    const fitsHeight = containerHeight == null || lines * px * lineHeight <= containerHeight;
    if (fitsLines && fitsHeight) return Math.round(px * 10) / 10;
  }

  return minPx;
}

export function fitTextFontSize(options: SmartTextFitOptions): string {
  return `${fitTextFontSizePx(options).toFixed(1)}px`;
}
