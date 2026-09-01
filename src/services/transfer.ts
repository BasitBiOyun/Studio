import { PlayerInfo } from '../types';
import { fitTextFontSize } from './smartTextFit';

export const MAX_TRANSFER_CONDITIONS = 3;

export function visibleTransferConditions(conditions: string[] = []): string[] {
  return conditions
    .map((condition) => condition.trim())
    .filter(Boolean)
    .slice(0, MAX_TRANSFER_CONDITIONS);
}

export function formatTransferPlayerMeta(player?: PlayerInfo | null): string {
  if (!player) return 'TRANSFER UPDATE';

  const parts = [
    player.positions?.trim(),
    player.age?.trim() ? `${player.age.trim()} Y/O` : '',
  ].filter(Boolean);

  return parts.length ? parts.join(' • ') : 'TRANSFER UPDATE';
}

export function transferHeadlineFontSize(headline: string, isWide: boolean): string {
  return fitTextFontSize({
    text: headline,
    preferredPx: isWide ? 96 : 120,
    minPx: isWide ? 56 : 72,
    maxLines: 2,
    charsPerLineAtPreferred: isWide ? 7 : 7,
    lineHeight: 0.88,
    containerHeightPx: isWide ? 175 : 220,
  });
}

export function transferPlayerLineFontSize(playerName: string, clubName: string, isWide: boolean): string {
  return fitTextFontSize({
    text: `${playerName} ➔ ${clubName}`.trim(),
    preferredPx: isWide ? 40 : 48,
    minPx: isWide ? 34 : 40,
    maxLines: 1,
    charsPerLineAtPreferred: 34,
    lineHeight: 1,
  });
}
