import { CLUB_CATALOGUE, normalizeClubName } from './clubCatalogue';

export type CompetitionType =
  | 'domestic-league'
  | 'domestic-cup'
  | 'continental-club'
  | 'international'
  | 'other';

export interface CompetitionCatalogueEntry {
  id: string;
  canonicalName: string;
  displayNameEn: string;
  displayNameTr: string;
  countryRegion: string;
  countryRegionTr?: string;
  type: CompetitionType;
  logoUrl?: string;
  wikidataId?: string | null;
  aliases?: string[];
}

const CURATED: CompetitionCatalogueEntry[] = [
  {
    id: 'uefa-champions-league',
    canonicalName: 'UEFA Champions League',
    displayNameEn: 'UEFA Champions League',
    displayNameTr: 'UEFA Şampiyonlar Ligi',
    countryRegion: 'Europe',
    countryRegionTr: 'Avrupa',
    type: 'continental-club',
    wikidataId: 'Q18756',
    aliases: ['Champions League', 'UCL', 'Şampiyonlar Ligi'],
  },
  {
    id: 'uefa-europa-league',
    canonicalName: 'UEFA Europa League',
    displayNameEn: 'UEFA Europa League',
    displayNameTr: 'UEFA Avrupa Ligi',
    countryRegion: 'Europe',
    countryRegionTr: 'Avrupa',
    type: 'continental-club',
    wikidataId: 'Q18760',
    aliases: ['Europa League', 'UEL', 'Avrupa Ligi'],
  },
  {
    id: 'uefa-conference-league',
    canonicalName: 'UEFA Conference League',
    displayNameEn: 'UEFA Conference League',
    displayNameTr: 'UEFA Konferans Ligi',
    countryRegion: 'Europe',
    countryRegionTr: 'Avrupa',
    type: 'continental-club',
    aliases: ['Conference League', 'UECL', 'Konferans Ligi'],
  },
  {
    id: 'fifa-world-cup',
    canonicalName: 'FIFA World Cup',
    displayNameEn: 'FIFA World Cup',
    displayNameTr: 'FIFA Dünya Kupası',
    countryRegion: 'World',
    countryRegionTr: 'Dünya',
    type: 'international',
    wikidataId: 'Q19317',
    aliases: ['World Cup', 'Dünya Kupası'],
  },
  {
    id: 'uefa-european-championship',
    canonicalName: 'UEFA European Championship',
    displayNameEn: 'UEFA European Championship',
    displayNameTr: 'UEFA Avrupa Şampiyonası',
    countryRegion: 'Europe',
    countryRegionTr: 'Avrupa',
    type: 'international',
    aliases: ['EURO', 'European Championship', 'Avrupa Şampiyonası'],
  },
  {
    id: 'copa-libertadores',
    canonicalName: 'Copa Libertadores',
    displayNameEn: 'Copa Libertadores',
    displayNameTr: 'Copa Libertadores',
    countryRegion: 'South America',
    countryRegionTr: 'Güney Amerika',
    type: 'continental-club',
    aliases: ['Libertadores'],
  },
  {
    id: 'afc-champions-league-elite',
    canonicalName: 'AFC Champions League Elite',
    displayNameEn: 'AFC Champions League Elite',
    displayNameTr: 'AFC Şampiyonlar Ligi Elite',
    countryRegion: 'Asia',
    countryRegionTr: 'Asya',
    type: 'continental-club',
    aliases: ['AFC Champions League'],
  },
];

const COMMON_TR_NAMES: Record<string, string> = {
  'premier league': 'Premier League',
  'la liga': 'La Liga',
  'laliga': 'La Liga',
  'serie a': 'Serie A',
  bundesliga: 'Bundesliga',
  'ligue 1': 'Ligue 1',
  eredivisie: 'Eredivisie',
  'primeira liga': 'Primeira Liga',
  'super lig': 'Süper Lig',
  'süper lig': 'Süper Lig',
  'scottish premiership': 'İskoçya Premiership',
  'belgian pro league': 'Belçika Pro League',
};

function normalize(value: unknown): string {
  return normalizeClubName(value);
}

function domesticLeagueEntries(): CompetitionCatalogueEntry[] {
  const byLeague = new Map<string, CompetitionCatalogueEntry>();

  for (const club of CLUB_CATALOGUE) {
    const league = String(club.league || '').trim();
    if (!league) continue;
    const country = String(club.country || '').trim();
    const key = `${normalize(league)}|${normalize(country)}`;
    const existing = byLeague.get(key);
    const candidate: CompetitionCatalogueEntry = {
      id: club.leagueId ? `wikidata:${club.leagueId}` : `league:${key}`,
      canonicalName: league,
      displayNameEn: league,
      displayNameTr: COMMON_TR_NAMES[normalize(league)] || league,
      countryRegion: country || 'Unknown',
      type: 'domestic-league',
      wikidataId: club.leagueId || null,
      aliases: [],
    };

    if (!existing || (!existing.wikidataId && candidate.wikidataId)) {
      byLeague.set(key, candidate);
    }
  }

  return [...byLeague.values()].sort((a, b) =>
    a.canonicalName.localeCompare(b.canonicalName, 'en', { sensitivity: 'base' }),
  );
}

function mergeEntries(): CompetitionCatalogueEntry[] {
  const merged = new Map<string, CompetitionCatalogueEntry>();
  for (const entry of [...CURATED, ...domesticLeagueEntries()]) {
    const key = `${normalize(entry.canonicalName)}|${normalize(entry.countryRegion)}`;
    const previous = merged.get(key);
    if (!previous) {
      merged.set(key, entry);
      continue;
    }
    merged.set(key, {
      ...entry,
      ...previous,
      wikidataId: previous.wikidataId || entry.wikidataId,
      logoUrl: previous.logoUrl || entry.logoUrl,
      aliases: [...new Set([...(previous.aliases || []), ...(entry.aliases || [])])],
    });
  }
  return [...merged.values()];
}

export const COMPETITION_CATALOGUE: CompetitionCatalogueEntry[] = mergeEntries();

export function displayCompetitionName(
  entry: Pick<CompetitionCatalogueEntry, 'displayNameEn' | 'displayNameTr'>,
  language: 'tr' | 'en',
): string {
  return language === 'tr' ? entry.displayNameTr : entry.displayNameEn;
}

export function displayCompetitionRegion(
  entry: Pick<CompetitionCatalogueEntry, 'countryRegion' | 'countryRegionTr'>,
  language: 'tr' | 'en',
): string {
  return language === 'tr' ? entry.countryRegionTr || entry.countryRegion : entry.countryRegion;
}

export function competitionTypeLabel(type: CompetitionType, language: 'tr' | 'en'): string {
  const labels: Record<CompetitionType, { en: string; tr: string }> = {
    'domestic-league': { en: 'Domestic League', tr: 'Ulusal Lig' },
    'domestic-cup': { en: 'Domestic Cup', tr: 'Ulusal Kupa' },
    'continental-club': { en: 'Continental Club', tr: 'Kıtasal Kulüp' },
    international: { en: 'National Teams', tr: 'Milli Takımlar' },
    other: { en: 'Other', tr: 'Diğer' },
  };
  return labels[type][language];
}

function scoreCompetition(entry: CompetitionCatalogueEntry, query: string): number {
  const q = normalize(query);
  if (!q) return 0;
  const names = [
    entry.canonicalName,
    entry.displayNameEn,
    entry.displayNameTr,
    entry.countryRegion,
    entry.countryRegionTr || '',
    ...(entry.aliases || []),
  ].map(normalize);

  let score = 0;
  for (const name of names) {
    if (!name) continue;
    if (name === q) score = Math.max(score, 120);
    else if (name.startsWith(q)) score = Math.max(score, 95);
    else if (name.includes(q)) score = Math.max(score, 78);
    else {
      const tokens = q.split(' ').filter(Boolean);
      const matched = tokens.filter((token) => name.includes(token)).length;
      if (matched === tokens.length && matched > 0) score = Math.max(score, 60 + matched);
    }
  }
  if (entry.type === 'continental-club' || entry.type === 'international') score += 6;
  return score;
}

export function searchCompetitionCatalogue(query: string, limit = 24): CompetitionCatalogueEntry[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  return COMPETITION_CATALOGUE
    .map((entry) => ({ entry, score: scoreCompetition(entry, q) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.canonicalName.localeCompare(b.entry.canonicalName))
    .slice(0, limit)
    .map((item) => item.entry);
}

export async function resolveCompetitionLogoUrl(entry: CompetitionCatalogueEntry): Promise<string> {
  if (entry.logoUrl) return entry.logoUrl;
  const qid = String(entry.wikidataId || '').trim();
  if (!/^Q\d+$/.test(qid)) return '';

  try {
    const response = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`, {
      headers: { Accept: 'application/json' },
      cache: 'force-cache',
    });
    if (!response.ok) return '';
    const data = await response.json();
    const claims = data?.entities?.[qid]?.claims?.P154;
    const filename = claims?.[0]?.mainsnak?.datavalue?.value;
    if (!filename || typeof filename !== 'string') return '';
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=500`;
  } catch {
    return '';
  }
}
