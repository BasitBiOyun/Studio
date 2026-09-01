import { fitTextFontSize } from './smartTextFit';

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
  return fitTextFontSize({
    text: `${team1 || ''} VS ${team2 || ''}`.trim(),
    preferredPx: isWide ? 78 : 100,
    minPx: isWide ? 42 : 56,
    maxLines: 2,
    charsPerLineAtPreferred: 10,
    lineHeight: 0.92,
    containerHeightPx: isWide ? 155 : 195,
  });
}

export function matchPreviewTeamFontSize(teamName: string, isWide = false): string {
  return fitTextFontSize({
    text: teamName,
    preferredPx: isWide ? 40 : 48,
    minPx: isWide ? 30 : 36,
    maxLines: 1,
    charsPerLineAtPreferred: 12,
    lineHeight: 1,
  });
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
