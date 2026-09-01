import { fitTextFontSize } from './smartTextFit';

export const MAX_MATCH_RESULT_STATS = 4;
export const MAX_MATCH_RESULT_SCORERS = 4;

export function matchResultHeaderContext(competition?: string, stage?: string): string {
  return [competition, stage]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' • ')
    .toUpperCase();
}

export function visibleMatchResultScorers(scorers: string[] = []): string[] {
  return scorers
    .map((scorer) => String(scorer || '').trim())
    .filter(Boolean)
    .slice(0, MAX_MATCH_RESULT_SCORERS);
}

export function visibleMatchResultStats<T extends { label?: string; val1?: string | number; val2?: string | number }>(stats: T[] = []): T[] {
  return stats
    .filter((stat) => {
      const label = String(stat?.label || '').trim();
      const val1 = String(stat?.val1 ?? '').trim();
      const val2 = String(stat?.val2 ?? '').trim();
      return Boolean(label && val1 && val2);
    })
    .slice(0, MAX_MATCH_RESULT_STATS);
}

export function matchResultScoreFontSize(team1: string, team2: string, isWide = false): string {
  return fitTextFontSize({
    text: `${team1 || ''} 0-0 ${team2 || ''}`.trim(),
    preferredPx: isWide ? 74 : 100,
    minPx: isWide ? 46 : 60,
    maxLines: 2,
    charsPerLineAtPreferred: 12,
    lineHeight: 0.92,
    containerHeightPx: isWide ? 150 : 195,
  });
}

export function matchResultMvpNameFontSize(name: string, isWide = false): string {
  return fitTextFontSize({
    text: name,
    preferredPx: isWide ? 28 : 32,
    minPx: isWide ? 21 : 24,
    maxLines: 1,
    charsPerLineAtPreferred: 18,
    lineHeight: 1,
  });
}
