import { StatItem } from '../types';
import { fitTextFontSize } from './smartTextFit';

export const MAX_STAT_HIGHLIGHT_CONTEXT_METRICS = 4;

export function visibleStatHighlightMetrics(metrics: StatItem[] = []): StatItem[] {
  return metrics
    .filter((metric) => String(metric?.label || '').trim() && String(metric?.value ?? '').trim())
    .slice(0, MAX_STAT_HIGHLIGHT_CONTEXT_METRICS);
}

export function statHighlightHeroFontSize(value: string, isWide = false): string {
  return fitTextFontSize({
    text: value,
    preferredPx: isWide ? 104 : 130,
    minPx: isWide ? 66 : 82,
    maxLines: 1,
    charsPerLineAtPreferred: 5,
    lineHeight: 1,
  });
}

export function statHighlightSubjectFontSize(subject: string, isWide = false): string {
  return fitTextFontSize({
    text: subject,
    preferredPx: isWide ? 70 : 88,
    minPx: isWide ? 48 : 62,
    maxLines: 2,
    charsPerLineAtPreferred: 8,
    lineHeight: 0.95,
    containerHeightPx: isWide ? 145 : 180,
  });
}

export function statHighlightSubjectMeta(positions?: string, club?: string): string {
  return [positions, club]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' • ');
}
