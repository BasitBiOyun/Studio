import { fitTextFontSize } from './smartTextFit';

export function quoteBodyFontSize(text: string, isWide = false): string {
  return fitTextFontSize({
    text,
    preferredPx: isWide ? 38 : 44,
    minPx: isWide ? 27 : 31,
    maxLines: isWide ? 6 : 7,
    charsPerLineAtPreferred: isWide ? 40 : 36,
    lineHeight: 1.12,
    containerHeightPx: isWide ? 280 : 390,
  });
}

export function quoteAuthorFontSize(name: string, isWide = false): string {
  return fitTextFontSize({
    text: name,
    preferredPx: isWide ? 36 : 44,
    minPx: isWide ? 27 : 32,
    maxLines: 2,
    charsPerLineAtPreferred: isWide ? 18 : 16,
    lineHeight: 1.02,
  });
}

export function quotePunchlineFontSize(text: string, isWide = false): string {
  return fitTextFontSize({
    text,
    preferredPx: isWide ? 18 : 22,
    minPx: isWide ? 14 : 17,
    maxLines: 2,
    charsPerLineAtPreferred: 35,
    lineHeight: 1.12,
  });
}

export function quoteHeaderContext(topicTag?: string, sourceDate?: string) {
  return {
    topicTag: String(topicTag || '').trim(),
    sourceDate: String(sourceDate || '').trim(),
  };
}
