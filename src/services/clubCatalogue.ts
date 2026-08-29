import catalogue from '../data/clubs_catalogue.json';

export interface ClubCatalogueEntry {
  id: string;
  name: string;
  country: string;
  league: string;
  logoUrl: string;
  logoSource?: string;
  scope?: 'top-division' | 'country-fallback' | string;
  topDivisionSource?: string | null;
  leagueId?: string | null;
  wikidataId?: string | null;
}

const CLUB_SUFFIX_TOKENS = new Set([
  'fc', 'cf', 'afc', 'sc', 'fk', 'sk', 'nk', 'jk', 'ac', 'bc', 'sv', 'ss', 'club', 'football', 'futbol', 'calcio',
]);

export function normalizeClubName(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function coreClubName(value: unknown): string {
  return normalizeClubName(value)
    .split(' ')
    .filter((token) => token && !CLUB_SUFFIX_TOKENS.has(token))
    .join(' ');
}

export const CLUB_CATALOGUE: ClubCatalogueEntry[] = (Array.isArray(catalogue) ? catalogue : [])
  .filter((club: any) => club && club.name && club.logoUrl)
  .map((club: any) => ({
    id: String(club.id || `${club.country || 'club'}:${club.name}`),
    name: String(club.name),
    country: String(club.country || ''),
    league: String(club.league || ''),
    logoUrl: String(club.logoUrl),
    logoSource: club.logoSource ? String(club.logoSource) : undefined,
    scope: club.scope ? String(club.scope) : undefined,
    topDivisionSource: club.topDivisionSource == null ? null : String(club.topDivisionSource),
    leagueId: club.leagueId == null ? null : String(club.leagueId),
    wikidataId: club.wikidataId == null ? null : String(club.wikidataId),
  }));

function scoreClub(club: ClubCatalogueEntry, query: string): number {
  const normalizedQuery = normalizeClubName(query);
  if (!normalizedQuery) return -1;

  const name = normalizeClubName(club.name);
  const core = coreClubName(club.name);
  const queryCore = coreClubName(normalizedQuery);
  let score = 0;

  if (name === normalizedQuery) score = 120;
  else if (core && queryCore && core === queryCore) score = 112;
  else if (name.startsWith(normalizedQuery)) score = 90;
  else if (name.includes(normalizedQuery)) score = 78;
  else {
    const queryTokens = normalizedQuery.split(' ').filter((token) => token.length > 1);
    const matchedTokens = queryTokens.filter((token) => name.includes(token)).length;
    if (matchedTokens === queryTokens.length && matchedTokens > 0) score = 65 + matchedTokens;
    else if (matchedTokens > 0) score = 35 + matchedTokens;
  }

  const country = normalizeClubName(club.country);
  const league = normalizeClubName(club.league);
  if (country.includes(normalizedQuery) || league.includes(normalizedQuery)) score = Math.max(score, 28);
  if (club.scope === 'top-division') score += 10;
  return score;
}

export function searchLocalClubCatalogue(query: string, limit = 12): ClubCatalogueEntry[] {
  const normalized = normalizeClubName(query);
  if (normalized.length < 2) return [];

  return CLUB_CATALOGUE
    .map((club) => ({ club, score: scoreClub(club, normalized) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.club.name.localeCompare(b.club.name))
    .slice(0, limit)
    .map((item) => item.club);
}

export function resolveClubLogoFromCatalogue(clubName: string): string | undefined {
  const normalized = normalizeClubName(clubName);
  if (!normalized) return undefined;

  const exact = CLUB_CATALOGUE.find((club) => normalizeClubName(club.name) === normalized);
  if (exact) return exact.logoUrl;

  const core = coreClubName(normalized);
  if (core.length >= 4) {
    const coreMatches = CLUB_CATALOGUE.filter((club) => coreClubName(club.name) === core);
    if (coreMatches.length === 1) return coreMatches[0].logoUrl;
    const topDivisionMatch = coreMatches.find((club) => club.scope === 'top-division');
    if (topDivisionMatch) return topDivisionMatch.logoUrl;
  }

  const result = searchLocalClubCatalogue(clubName, 1)[0];
  return result?.logoUrl;
}
