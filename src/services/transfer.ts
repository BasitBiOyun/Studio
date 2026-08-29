import { PlayerInfo } from '../types';

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
  const length = headline.trim().length;

  if (isWide) {
    if (length <= 10) return '96px';
    if (length <= 16) return '82px';
    if (length <= 22) return '68px';
    return '56px';
  }

  if (length <= 10) return '120px';
  if (length <= 16) return '104px';
  if (length <= 22) return '88px';
  return '72px';
}

export function transferPlayerLineFontSize(playerName: string, clubName: string, isWide: boolean): string {
  const length = `${playerName} ${clubName}`.trim().length;
  if (isWide) return length > 34 ? '34px' : '40px';
  return length > 34 ? '40px' : '48px';
}
