import { StatItem } from '../types';
import { fitTextFontSize } from './smartTextFit';

export const MAX_TEAM_PROFILE_METRICS = 4;
export const MAX_TEAM_PROFILE_POINTS = 3;

export function teamProfileHeaderContext(league?: string, leagueRank?: string): string {
  return [league, leagueRank]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' • ')
    .toUpperCase();
}

export function visibleTeamProfileMetrics(metrics: StatItem[] = []): StatItem[] {
  return metrics
    .filter((metric) => String(metric?.label || '').trim() && String(metric?.value ?? '').trim())
    .slice(0, MAX_TEAM_PROFILE_METRICS);
}

export function visibleTeamProfilePoints(points: string[] = []): string[] {
  return points
    .map((point) => String(point || '').trim())
    .filter(Boolean)
    .slice(0, MAX_TEAM_PROFILE_POINTS);
}

export function teamProfileTitleFontSize(teamName: string, isWide = false): string {
  return fitTextFontSize({
    text: teamName,
    preferredPx: isWide ? 76 : 100,
    minPx: isWide ? 48 : 62,
    maxLines: 2,
    charsPerLineAtPreferred: 7,
    lineHeight: 0.92,
    containerHeightPx: isWide ? 150 : 195,
  });
}

export function teamProfileStyleFontSize(style: string, isWide = false): string {
  return fitTextFontSize({
    text: style,
    preferredPx: isWide ? 25 : 32,
    minPx: isWide ? 18 : 23,
    maxLines: 3,
    charsPerLineAtPreferred: isWide ? 13 : 12,
    lineHeight: 1.15,
    containerHeightPx: isWide ? 95 : 125,
  });
}
