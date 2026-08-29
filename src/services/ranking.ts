import { RankingTopItem } from '../types';

export const MAX_RANKING_ITEMS = 5;

export function visibleRankingItems(items: RankingTopItem[] = []): RankingTopItem[] {
  return items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => String(item?.playerName || '').trim() && String(item?.val ?? '').trim())
    .sort((a, b) => {
      const rankA = Number.isFinite(a.item.rank) ? a.item.rank : Number.POSITIVE_INFINITY;
      const rankB = Number.isFinite(b.item.rank) ? b.item.rank : Number.POSITIVE_INFINITY;
      return rankA === rankB ? a.index - b.index : rankA - rankB;
    })
    .slice(0, MAX_RANKING_ITEMS)
    .map(({ item }) => ({
      ...item,
      playerName: String(item.playerName || '').trim(),
      club: String(item.club || '').trim(),
      val: String(item.val ?? '').trim(),
      subVal: item.subVal == null ? undefined : String(item.subVal).trim(),
    }));
}

export function rankingMeta(club?: string, subVal?: string): string {
  return [club, subVal]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' • ');
}

export function rankingTitleFontSize(title: string, isWide = false): string {
  const length = String(title || '').trim().length;
  if (isWide) {
    if (length <= 18) return '72px';
    if (length <= 30) return '62px';
    return '52px';
  }

  if (length <= 18) return '96px';
  if (length <= 30) return '82px';
  return '70px';
}

export function rankingNameFontSize(name: string, isWide = false): string {
  const length = String(name || '').trim().length;
  if (isWide) {
    if (length <= 18) return '30px';
    if (length <= 28) return '27px';
    return '24px';
  }

  if (length <= 18) return '34px';
  if (length <= 28) return '30px';
  return '26px';
}

export function rankingValueFontSize(value: string, isWide = false): string {
  const length = String(value || '').trim().length;
  if (isWide) {
    if (length <= 7) return '42px';
    if (length <= 11) return '36px';
    return '31px';
  }

  if (length <= 7) return '46px';
  if (length <= 11) return '40px';
  return '34px';
}
