import { RankingTopItem } from '../types';
import { fitTextFontSize } from './smartTextFit';

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
  return fitTextFontSize({
    text: title,
    preferredPx: isWide ? 72 : 96,
    minPx: isWide ? 52 : 70,
    maxLines: 2,
    charsPerLineAtPreferred: isWide ? 16 : 14,
    lineHeight: 0.98,
  });
}

export function rankingNameFontSize(name: string, isWide = false): string {
  return fitTextFontSize({
    text: name,
    preferredPx: isWide ? 30 : 34,
    minPx: isWide ? 24 : 26,
    maxLines: 1,
    charsPerLineAtPreferred: isWide ? 18 : 20,
    lineHeight: 1.02,
  });
}

export function rankingValueFontSize(value: string, isWide = false): string {
  return fitTextFontSize({
    text: value,
    preferredPx: isWide ? 42 : 46,
    minPx: isWide ? 31 : 34,
    maxLines: 1,
    charsPerLineAtPreferred: 7,
    lineHeight: 1,
  });
}
