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
  const longest = Math.max(String(team1 || '').trim().length, String(team2 || '').trim().length);
  const combined = String(team1 || '').trim().length + String(team2 || '').trim().length;

  if (isWide) {
    if (longest <= 14 && combined <= 24) return '74px';
    if (longest <= 20 && combined <= 34) return '64px';
    if (longest <= 28 && combined <= 46) return '54px';
    return '46px';
  }

  if (longest <= 14 && combined <= 24) return '100px';
  if (longest <= 20 && combined <= 34) return '86px';
  if (longest <= 28 && combined <= 46) return '72px';
  return '60px';
}

export function matchResultMvpNameFontSize(name: string, isWide = false): string {
  const length = String(name || '').trim().length;
  if (isWide) {
    if (length <= 18) return '28px';
    if (length <= 28) return '24px';
    return '21px';
  }

  if (length <= 18) return '32px';
  if (length <= 28) return '28px';
  return '24px';
}
