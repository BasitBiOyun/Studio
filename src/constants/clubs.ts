import { CLUB_CATALOGUE, coreClubName, normalizeClubName } from '../services/clubCatalogue';

const TRUSTED_CLUB_OVERRIDES: Record<string, string> = {
  'real madrid': 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
  'barcelona': 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
  'fc barcelona': 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
  'arsenal': 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
  'arsenal fc': 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
  'manchester city': 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
  'manchester united': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
  'liverpool': 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
  'liverpool fc': 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
  'chelsea': 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
  'chelsea fc': 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
  'bayern munich': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg',
  'bayern munchen': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg',
  'borussia dortmund': 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
  'psg': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
  'paris saint germain': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
  'juventus': 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg',
  'juventus fc': 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg',
  'ac milan': 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
  'inter milan': 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',
  'inter': 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',
  'kaa gent': 'https://upload.wikimedia.org/wikipedia/en/0/01/KAA_Gent_logo.svg',
};

function buildClubLibrary(): Record<string, string> {
  const library: Record<string, string> = {};
  const coreBuckets = new Map<string, Set<string>>();

  for (const club of CLUB_CATALOGUE) {
    const rawKey = club.name.toLowerCase().trim();
    const normalizedKey = normalizeClubName(club.name);
    if (rawKey) library[rawKey] = club.logoUrl;
    if (normalizedKey) library[normalizedKey] = club.logoUrl;

    const core = coreClubName(club.name);
    if (core.length >= 4) {
      const urls = coreBuckets.get(core) || new Set<string>();
      urls.add(club.logoUrl);
      coreBuckets.set(core, urls);
    }
  }

  for (const [core, urls] of coreBuckets.entries()) {
    if (urls.size === 1 && !library[core]) {
      library[core] = [...urls][0];
    }
  }

  for (const [key, url] of Object.entries(TRUSTED_CLUB_OVERRIDES)) {
    library[key] = url;
    library[normalizeClubName(key)] = url;
  }

  return library;
}

export const CLUB_LIBRARY: Record<string, string> = buildClubLibrary();
