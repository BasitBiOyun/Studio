import { StatItem } from '../types';

export const MAX_STAT_HIGHLIGHT_CONTEXT_METRICS = 4;

export function visibleStatHighlightMetrics(metrics: StatItem[] = []): StatItem[] {
  return metrics
    .filter((metric) => String(metric?.label || '').trim() && String(metric?.value ?? '').trim())
    .slice(0, MAX_STAT_HIGHLIGHT_CONTEXT_METRICS);
}

export function statHighlightHeroFontSize(value: string, isWide = false): string {
  const length = String(value || '').trim().length;

  if (isWide) {
    if (length <= 5) return '104px';
    if (length <= 8) return '92px';
    if (length <= 12) return '78px';
    return '66px';
  }

  if (length <= 5) return '130px';
  if (length <= 8) return '116px';
  if (length <= 12) return '98px';
  return '82px';
}

export function statHighlightSubjectFontSize(subject: string, isWide = false): string {
  const length = String(subject || '').trim().length;
  if (isWide) {
    if (length <= 16) return '70px';
    if (length <= 28) return '58px';
    return '48px';
  }

  if (length <= 16) return '88px';
  if (length <= 28) return '74px';
  return '62px';
}

export function statHighlightSubjectMeta(positions?: string, club?: string): string {
  return [positions, club]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' • ');
}
