export const MAX_MATCH_PREVIEW_FORM = 5;
export const MAX_MATCH_PREVIEW_KEYS = 3;

export function visibleMatchForm(form: string[] = []): string[] {
  return form
    .map((result) => String(result).trim().toUpperCase())
    .filter(Boolean)
    .slice(0, MAX_MATCH_PREVIEW_FORM);
}

export function visibleTacticalKeys(keys: string[] = []): string[] {
  return keys
    .map((key) => String(key).trim())
    .filter(Boolean)
    .slice(0, MAX_MATCH_PREVIEW_KEYS);
}

export function tacticalDecidersLabel(count: number): string {
  if (count <= 0) return '';
  return `${count} KEY TACTICAL DECIDER${count === 1 ? '' : 'S'}`;
}

export function matchPreviewTitleFontSize(team1: string, team2: string, isWide = false): string {
  const length = `${team1 || ''} VS ${team2 || ''}`.trim().length;

  if (isWide) {
    if (length <= 20) return '78px';
    if (length <= 30) return '66px';
    if (length <= 42) return '56px';
    if (length <= 54) return '48px';
    return '42px';
  }

  if (length <= 20) return '100px';
  if (length <= 30) return '88px';
  if (length <= 42) return '76px';
  if (length <= 54) return '64px';
  return '56px';
}

export function matchPreviewTeamFontSize(teamName: string, isWide = false): string {
  const length = (teamName || '').trim().length;
  if (isWide) {
    if (length <= 12) return '40px';
    if (length <= 20) return '34px';
    return '30px';
  }
  if (length <= 12) return '48px';
  if (length <= 20) return '42px';
  return '36px';
}

export interface MatchTiming {
  kickoffTime: string;
  venue: string;
}

export function resolveMatchTiming(kickoffTime?: string, explicitVenue?: string): MatchTiming {
  const raw = (kickoffTime || '').trim();
  const venue = (explicitVenue || '').trim();

  if (venue) return { kickoffTime: raw, venue };

  const separators = [' • ', ' | ', ' — ', ' - '];
  for (const separator of separators) {
    if (!raw.includes(separator)) continue;
    const [timePart, ...venueParts] = raw.split(separator);
    const derivedVenue = venueParts.join(separator).trim();
    if (timePart.trim() && derivedVenue) {
      return { kickoffTime: timePart.trim(), venue: derivedVenue };
    }
  }

  return { kickoffTime: raw, venue: '' };
}
