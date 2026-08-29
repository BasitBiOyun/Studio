import { StatItem } from '../types';

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
  const length = String(teamName || '').trim().length;

  if (isWide) {
    if (length <= 14) return '76px';
    if (length <= 22) return '66px';
    if (length <= 32) return '56px';
    return '48px';
  }

  if (length <= 14) return '100px';
  if (length <= 22) return '86px';
  if (length <= 32) return '72px';
  return '62px';
}

export function teamProfileStyleFontSize(style: string, isWide = false): string {
  const length = String(style || '').trim().length;

  if (isWide) {
    if (length <= 34) return '25px';
    if (length <= 54) return '21px';
    return '18px';
  }

  if (length <= 34) return '32px';
  if (length <= 54) return '27px';
  return '23px';
}
