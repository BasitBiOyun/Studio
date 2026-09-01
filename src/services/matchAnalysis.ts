import { fitTextFontSize } from './smartTextFit';

export const MAX_MATCH_ANALYSIS_STATS = 4;
export const MAX_MATCH_ANALYSIS_TAKEAWAYS = 3;
export const MAX_MATCH_ANALYSIS_SCORERS_PER_TEAM = 4;

export interface MatchAnalysisStatLike {
  label: string;
  val1: string;
  val2: string;
  val1Num?: number;
  val2Num?: number;
}

export function visibleMatchAnalysisStats<T extends MatchAnalysisStatLike>(stats: T[] = []): T[] {
  return stats
    .filter((stat) => String(stat.label || '').trim())
    .slice(0, MAX_MATCH_ANALYSIS_STATS);
}

export function visibleMatchAnalysisTakeaways(takeaways: string[] = []): string[] {
  return takeaways
    .map((takeaway) => String(takeaway).trim())
    .filter(Boolean)
    .slice(0, MAX_MATCH_ANALYSIS_TAKEAWAYS);
}

export function visibleMatchAnalysisScorers(scorers: string[] = []): string[] {
  return scorers
    .map((scorer) => String(scorer).trim())
    .filter(Boolean)
    .slice(0, MAX_MATCH_ANALYSIS_SCORERS_PER_TEAM);
}

function comparableValue(displayValue: string, numericValue?: number): number | null {
  if (typeof numericValue === 'number' && Number.isFinite(numericValue)) {
    return numericValue;
  }

  const match = String(displayValue ?? '').replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function matchAnalysisMetricShare(stat: MatchAnalysisStatLike): number {
  const raw1 = comparableValue(stat.val1, stat.val1Num);
  const raw2 = comparableValue(stat.val2, stat.val2Num);

  if (raw1 === null || raw2 === null) return 50;

  const value1 = Math.max(0, raw1);
  const value2 = Math.max(0, raw2);
  const total = value1 + value2;
  if (total <= 0) return 50;

  return Math.max(0, Math.min(100, Math.round((value1 / total) * 100)));
}

export function matchAnalysisScoreFontSize(team1: string, team2: string, isWide = false): string {
  return fitTextFontSize({
    text: `${team1 || ''} 0-0 ${team2 || ''}`.trim(),
    preferredPx: isWide ? 74 : 96,
    minPx: isWide ? 40 : 54,
    maxLines: 2,
    charsPerLineAtPreferred: 11,
    lineHeight: 0.92,
    containerHeightPx: isWide ? 150 : 190,
  });
}

export function matchAnalysisHeaderLabel(competition?: string): string {
  const normalizedCompetition = (competition || '').trim().toUpperCase();
  return normalizedCompetition
    ? `${normalizedCompetition} • POST-MATCH ANALYSIS`
    : 'POST-MATCH ANALYSIS';
}
