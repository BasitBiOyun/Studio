const https = require('https');
const fs = require('fs');
const path = require('path');

const USER_AGENT = 'BasitBiOyun-Studio/1.0 club-catalogue-sync';
const ROOT = process.cwd();
const OUTPUTS = [
  path.join(ROOT, 'src/data/clubs_catalogue.json'),
  path.join(ROOT, 'public/clubs_catalogue.json'),
];
const META_OUTPUTS = [
  path.join(ROOT, 'src/data/clubs_catalogue_meta.json'),
  path.join(ROOT, 'public/clubs_catalogue_meta.json'),
];

const ASSOCIATIONS = [
  ['Albania', 'Kategoria Superiore', 'albania'],
  ['Andorra', 'Primera Divisió', 'andorra'],
  ['Armenia', 'Armenian Premier League', 'armenia'],
  ['Austria', 'Austrian Football Bundesliga', 'austria'],
  ['Azerbaijan', 'Azerbaijan Premier League', 'azerbaijan'],
  ['Belarus', 'Belarusian Premier League', 'belarus'],
  ['Belgium', 'Belgian Pro League', 'belgium'],
  ['Bosnia and Herzegovina', 'Premier League of Bosnia and Herzegovina', 'bosnia-and-herzegovina'],
  ['Bulgaria', 'First Professional Football League', 'bulgaria'],
  ['Croatia', 'Croatian Football League', 'croatia'],
  ['Cyprus', 'Cypriot First Division', 'cyprus'],
  ['Czechia', 'Czech First League', 'czech-republic'],
  ['Denmark', 'Danish Superliga', 'denmark'],
  ['England', 'Premier League', 'england'],
  ['Estonia', 'Meistriliiga', 'estonia'],
  ['Faroe Islands', 'Faroe Islands Premier League', 'faroe-islands'],
  ['Finland', 'Veikkausliiga', 'finland'],
  ['France', 'Ligue 1', 'france'],
  ['Georgia', 'Erovnuli Liga', 'georgia'],
  ['Germany', 'Bundesliga', 'germany'],
  ['Gibraltar', 'Gibraltar Football League', 'gibraltar'],
  ['Greece', 'Super League Greece', 'greece'],
  ['Hungary', 'Nemzeti Bajnokság I', 'hungary'],
  ['Iceland', 'Besta deild karla', 'iceland'],
  ['Israel', 'Israeli Premier League', 'israel'],
  ['Italy', 'Serie A', 'italy'],
  ['Kazakhstan', 'Kazakhstan Premier League', 'kazakhstan'],
  ['Kosovo', 'Football Superleague of Kosovo', 'kosovo'],
  ['Latvia', 'Latvian Higher League', 'latvia'],
  ['Lithuania', 'A Lyga', 'lithuania'],
  ['Luxembourg', 'Luxembourg National Division', 'luxembourg'],
  ['Malta', 'Maltese Premier League', 'malta'],
  ['Moldova', 'Moldovan Super Liga', 'moldova'],
  ['Montenegro', 'Montenegrin First League', 'montenegro'],
  ['Netherlands', 'Eredivisie', 'netherlands'],
  ['North Macedonia', 'Macedonian First Football League', 'north-macedonia'],
  ['Northern Ireland', 'NIFL Premiership', 'northern-ireland'],
  ['Norway', 'Eliteserien', 'norway'],
  ['Poland', 'Ekstraklasa', 'poland'],
  ['Portugal', 'Primeira Liga', 'portugal'],
  ['Republic of Ireland', 'League of Ireland Premier Division', 'ireland'],
  ['Romania', 'Liga I', 'romania'],
  ['Russia', 'Russian Premier League', 'russia'],
  ['San Marino', 'Campionato Sammarinese di Calcio', 'san-marino'],
  ['Scotland', 'Scottish Premiership', 'scotland'],
  ['Serbia', 'Serbian SuperLiga', 'serbia'],
  ['Slovakia', 'Slovak First Football League', 'slovakia'],
  ['Slovenia', 'Slovenian PrvaLiga', 'slovenia'],
  ['Spain', 'La Liga', 'spain'],
  ['Sweden', 'Allsvenskan', 'sweden'],
  ['Switzerland', 'Swiss Super League', 'switzerland'],
  ['Türkiye', 'Süper Lig', 'turkey'],
  ['Ukraine', 'Ukrainian Premier League', 'ukraine'],
  ['Wales', 'Cymru Premier', 'wales'],
].map(([name, leagueSearch, joseSlug]) => ({ name, leagueSearch, joseSlug }));

const ASSOCIATION_BY_NORMALIZED_NAME = new Map(
  ASSOCIATIONS.map((association) => [normalize(association.name), association]),
);

const COUNTRY_ALIASES = new Map([
  ['czech republic', 'Czechia'],
  ['turkey', 'Türkiye'],
  ['turkiye', 'Türkiye'],
  ['republic of ireland', 'Republic of Ireland'],
  ['ireland', 'Republic of Ireland'],
]);

const CLUB_SUFFIX_TOKENS = new Set([
  'fc', 'cf', 'afc', 'sc', 'fk', 'sk', 'nk', 'jk', 'ac', 'bc', 'sv', 'ss', 'club', 'football', 'futbol', 'calcio',
]);

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function coreClubName(value) {
  return normalize(value)
    .split(' ')
    .filter((token) => token && !CLUB_SUFFIX_TOKENS.has(token))
    .join(' ');
}

function encodePath(rawPath) {
  return String(rawPath).split('/').map((segment) => encodeURIComponent(segment)).join('/');
}

function requestJson(url, attempts = 3) {
  return new Promise((resolve, reject) => {
    const run = (attempt) => {
      const req = https.get(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': USER_AGENT,
        },
        timeout: 20000,
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          requestJson(new URL(res.headers.location, url).toString(), attempts).then(resolve, reject);
          return;
        }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            if (attempt < attempts) {
              setTimeout(() => run(attempt + 1), 600 * attempt);
              return;
            }
            reject(new Error(`HTTP ${res.statusCode} for ${url}: ${body.slice(0, 180)}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(new Error(`Invalid JSON from ${url}: ${error.message}`));
          }
        });
      });
      req.on('timeout', () => req.destroy(new Error(`Timeout for ${url}`)));
      req.on('error', (error) => {
        if (attempt < attempts) {
          setTimeout(() => run(attempt + 1), 600 * attempt);
          return;
        }
        reject(error);
      });
    };
    run(1);
  });
}

async function fetchGitTree(owner, repo, ref) {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`;
  const json = await requestJson(url);
  if (!Array.isArray(json.tree)) throw new Error(`Git tree missing for ${owner}/${repo}`);
  return json.tree;
}

function resolveAssociationName(raw) {
  const normalized = normalize(raw);
  const alias = COUNTRY_ALIASES.get(normalized);
  if (alias) return alias;
  const exact = ASSOCIATION_BY_NORMALIZED_NAME.get(normalized);
  return exact?.name || raw;
}

function buildJoseIndex(tree) {
  const byCountry = new Map();
  for (const item of tree) {
    if (item.type !== 'blob' || !item.path?.startsWith('logos/') || !item.path.toLowerCase().endsWith('.svg')) continue;
    const parts = item.path.split('/');
    if (parts.length !== 3) continue;
    const countrySlug = parts[1];
    const fileName = parts[2].replace(/\.svg$/i, '').replace(/_/g, ' ');
    const entry = {
      name: fileName,
      normalized: normalize(fileName),
      core: coreClubName(fileName),
      url: `https://raw.githubusercontent.com/JoseArroyave/football-logos/main/${encodePath(item.path)}`,
    };
    const list = byCountry.get(countrySlug) || [];
    list.push(entry);
    byCountry.set(countrySlug, list);
  }
  return byCountry;
}

function findJoseCountry(index, requestedSlug) {
  if (index.has(requestedSlug)) return requestedSlug;
  const target = normalize(requestedSlug.replace(/-/g, ' '));
  return [...index.keys()].find((slug) => normalize(slug.replace(/-/g, ' ')) === target) || null;
}

function matchJoseLogo(index, association, clubName) {
  const countrySlug = findJoseCountry(index, association.joseSlug);
  if (!countrySlug) return null;
  const list = index.get(countrySlug) || [];
  const normalized = normalize(clubName);
  const exact = list.filter((candidate) => candidate.normalized === normalized);
  if (exact.length === 1) return exact[0].url;
  const core = coreClubName(clubName);
  if (core.length >= 4) {
    const coreMatches = list.filter((candidate) => candidate.core === core);
    if (coreMatches.length === 1) return coreMatches[0].url;
  }
  return null;
}

function parseLuukCurrent(tree) {
  const rows = [];
  for (const item of tree) {
    if (item.type !== 'blob' || !item.path?.startsWith('logos/') || !item.path.toLowerCase().endsWith('.png')) continue;
    const parts = item.path.split('/');
    if (parts.length !== 3) continue;
    const leagueDir = parts[1];
    const separator = leagueDir.indexOf(' - ');
    if (separator < 0) continue;
    const rawCountry = leagueDir.slice(0, separator).trim();
    const league = leagueDir.slice(separator + 3).trim();
    const country = resolveAssociationName(rawCountry);
    if (!ASSOCIATION_BY_NORMALIZED_NAME.has(normalize(country))) continue;
    const name = parts[2].replace(/\.png$/i, '');
    rows.push({
      id: `luuk:${normalize(country)}:${normalize(name)}`,
      name,
      country,
      league,
      leagueId: null,
      wikidataId: null,
      fallbackLogoUrl: `https://raw.githubusercontent.com/luukhopman/football-logos/master/${encodePath(item.path)}`,
      wikidataLogoUrl: null,
      scope: 'top-division',
      topDivisionSource: 'luukhopman-2026-27',
    });
  }
  return rows;
}

function leagueCandidateScore(candidate, searchTerm) {
  const label = normalize(candidate.label);
  const search = normalize(searchTerm);
  const description = normalize(candidate.description);
  if (/women|womens|futsal|youth|under 21|season/.test(description) || /season/.test(label)) return -1000;
  let score = 0;
  if (label === search) score += 100;
  else if (label.includes(search) || search.includes(label)) score += 55;
  const searchTokens = search.split(' ').filter((token) => token.length > 2);
  const overlap = searchTokens.filter((token) => label.includes(token)).length;
  score += overlap * 8;
  if (/football|soccer/.test(description)) score += 18;
  if (/league|division|championship|top tier|highest/.test(description)) score += 18;
  if (/professional/.test(description)) score += 4;
  return score;
}

async function resolveLeagueEntity(association) {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&type=item&limit=10&search=${encodeURIComponent(association.leagueSearch)}`;
  const json = await requestJson(url, 2);
  const candidates = Array.isArray(json.search) ? json.search : [];
  const ranked = candidates
    .map((candidate) => ({ candidate, score: leagueCandidateScore(candidate, association.leagueSearch) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!ranked.length) return null;
  return {
    id: ranked[0].candidate.id,
    label: ranked[0].candidate.label || association.leagueSearch,
    score: ranked[0].score,
  };
}

async function resolveRemainingLeagues(associations) {
  const resolved = new Map();
  for (const association of associations) {
    try {
      const result = await resolveLeagueEntity(association);
      if (result) resolved.set(association.name, result);
      else console.warn(`[clubs] Wikidata league not resolved: ${association.name} / ${association.leagueSearch}`);
    } catch (error) {
      console.warn(`[clubs] Wikidata league search failed: ${association.name}: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  return resolved;
}

async function fetchWikidataClubs(resolvedLeagues) {
  if (!resolvedLeagues.size) return [];
  const leagueIds = [...new Set([...resolvedLeagues.values()].map((value) => value.id))];
  const query = `
SELECT DISTINCT ?club ?clubLabel ?league ?logo WHERE {
  VALUES ?league { ${leagueIds.map((id) => `wd:${id}`).join(' ')} }
  ?club wdt:P118 ?league .
  ?club wdt:P31/wdt:P279* wd:Q476028 .
  OPTIONAL { ?club wdt:P154 ?logo . }
  FILTER NOT EXISTS { ?club wdt:P576 ?dissolved . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`;
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
  const json = await requestJson(url, 3);
  const bindings = json?.results?.bindings;
  if (!Array.isArray(bindings)) throw new Error('Wikidata club query returned no bindings array.');
  return bindings.map((binding) => ({
    clubId: String(binding.club?.value || '').split('/').pop(),
    name: binding.clubLabel?.value || '',
    leagueId: String(binding.league?.value || '').split('/').pop(),
    logoUrl: binding.logo?.value || null,
  })).filter((row) => row.clubId && row.name && row.leagueId);
}

function sanitizeRemoteLogo(url) {
  if (!url) return null;
  return String(url).replace(/^http:\/\//i, 'https://');
}

function isLikelyClubLogoFile(name) {
  const normalized = normalize(name);
  if (!normalized || normalized.length < 2) return false;
  return !/(league|division|federation|association|championship|cup|super lig logo|premier league logo)/.test(normalized);
}

function addCountryFallbacks(rows, joseIndex, associationsWithTopDivision) {
  const fallbackAssociations = [];
  for (const association of ASSOCIATIONS) {
    if (associationsWithTopDivision.has(association.name)) continue;
    const countrySlug = findJoseCountry(joseIndex, association.joseSlug);
    const candidates = countrySlug ? (joseIndex.get(countrySlug) || []) : [];
    const usable = candidates.filter((candidate) => isLikelyClubLogoFile(candidate.name));
    if (!usable.length) {
      fallbackAssociations.push({ association: association.name, entries: 0 });
      continue;
    }
    for (const candidate of usable) {
      rows.push({
        id: `fallback:${normalize(association.name)}:${candidate.normalized}`,
        name: candidate.name,
        country: association.name,
        league: association.leagueSearch,
        leagueId: null,
        wikidataId: null,
        logoUrl: candidate.url,
        logoSource: 'josearroyave-svg',
        scope: 'country-fallback',
        topDivisionSource: null,
      });
    }
    fallbackAssociations.push({ association: association.name, entries: usable.length });
  }
  return fallbackAssociations;
}

function dedupeRows(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!row.logoUrl || !row.name || !row.country) continue;
    const key = `${normalize(row.country)}|${normalize(row.name)}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, row);
      continue;
    }
    if (existing.scope !== 'top-division' && row.scope === 'top-division') {
      map.set(key, row);
      continue;
    }
    if (existing.logoSource !== 'josearroyave-svg' && row.logoSource === 'josearroyave-svg') {
      map.set(key, row);
    }
  }
  return [...map.values()];
}

function writeJson(files, value) {
  const payload = `${JSON.stringify(value, null, 2)}\n`;
  for (const file of files) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, payload, 'utf8');
  }
}

function existingSnapshot() {
  const file = OUTPUTS[0];
  if (!fs.existsSync(file)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function main() {
  const snapshot = existingSnapshot();
  console.log(`[clubs] Existing snapshot: ${snapshot.length} entries.`);

  let luukTree;
  let joseTree;
  try {
    [luukTree, joseTree] = await Promise.all([
      fetchGitTree('luukhopman', 'football-logos', 'master'),
      fetchGitTree('JoseArroyave', 'football-logos', 'main'),
    ]);
  } catch (error) {
    if (snapshot.length >= 450) {
      console.warn(`[clubs] Remote sync unavailable; keeping checked-in snapshot (${snapshot.length}). ${error.message}`);
      return;
    }
    throw error;
  }

  const joseIndex = buildJoseIndex(joseTree);
  const activeRows = parseLuukCurrent(luukTree);
  const topDivisionAssociations = new Set(activeRows.map((row) => row.country));

  const remaining = ASSOCIATIONS.filter((association) => !topDivisionAssociations.has(association.name));
  const resolvedLeagues = await resolveRemainingLeagues(remaining);

  let wikidataRows = [];
  try {
    const rawClubs = await fetchWikidataClubs(resolvedLeagues);
    const leagueMeta = new Map([...resolvedLeagues.entries()].map(([associationName, league]) => [league.id, { associationName, league }]));
    const seenClub = new Set();
    for (const club of rawClubs) {
      const meta = leagueMeta.get(club.leagueId);
      if (!meta) continue;
      const association = ASSOCIATIONS.find((item) => item.name === meta.associationName);
      if (!association) continue;
      const key = `${club.clubId}|${club.leagueId}`;
      if (seenClub.has(key)) continue;
      seenClub.add(key);
      const joseLogo = matchJoseLogo(joseIndex, association, club.name);
      wikidataRows.push({
        id: club.clubId,
        name: club.name,
        country: association.name,
        league: meta.league.label || association.leagueSearch,
        leagueId: club.leagueId,
        wikidataId: club.clubId,
        fallbackLogoUrl: null,
        wikidataLogoUrl: sanitizeRemoteLogo(club.logoUrl),
        logoUrl: joseLogo || sanitizeRemoteLogo(club.logoUrl),
        logoSource: joseLogo ? 'josearroyave-svg' : 'wikidata-p154',
        scope: 'top-division',
        topDivisionSource: 'wikidata-current-league',
      });
    }
  } catch (error) {
    console.warn(`[clubs] Wikidata club query failed; small-association country fallbacks will be used. ${error.message}`);
  }

  for (const row of activeRows) {
    const association = ASSOCIATIONS.find((item) => item.name === row.country);
    if (!association) continue;
    const joseLogo = matchJoseLogo(joseIndex, association, row.name);
    row.logoUrl = joseLogo || row.fallbackLogoUrl;
    row.logoSource = joseLogo ? 'josearroyave-svg' : 'luukhopman-png';
  }

  for (const row of wikidataRows) {
    if (row.logoUrl) topDivisionAssociations.add(row.country);
  }
  for (const row of activeRows) topDivisionAssociations.add(row.country);

  const withLogo = [...activeRows, ...wikidataRows].filter((row) => row.logoUrl);
  const fallbackAssociations = addCountryFallbacks(withLogo, joseIndex, topDivisionAssociations);
  const finalRows = dedupeRows(withLogo)
    .sort((a, b) => a.country.localeCompare(b.country) || a.league.localeCompare(b.league) || a.name.localeCompare(b.name));

  const representedAssociations = new Set(finalRows.map((row) => row.country));
  const topDivisionRows = finalRows.filter((row) => row.scope === 'top-division');
  const topDivisionCountries = new Set(topDivisionRows.map((row) => row.country));
  const missingAssociations = ASSOCIATIONS.filter((association) => !representedAssociations.has(association.name)).map((association) => association.name);
  const topDivisionMissing = ASSOCIATIONS.filter((association) => !topDivisionCountries.has(association.name)).map((association) => association.name);

  if (finalRows.length < 350) {
    throw new Error(`Generated club catalogue is unexpectedly small (${finalRows.length}).`);
  }

  const meta = {
    schemaVersion: 'uefa-club-catalogue-v1',
    generatedAt: new Date().toISOString(),
    target: 'UEFA men domestic top divisions',
    uefaMemberAssociations: 55,
    domesticLeagueAssociationsExpected: ASSOCIATIONS.length,
    liechtensteinNote: 'Liechtenstein has no domestic league; its clubs play in the Swiss league system.',
    totalEntries: finalRows.length,
    topDivisionEntries: topDivisionRows.length,
    representedAssociations: representedAssociations.size,
    topDivisionAssociations: topDivisionCountries.size,
    fallbackAssociations: fallbackAssociations.filter((item) => item.entries > 0),
    missingAssociations,
    topDivisionMissing,
    sources: [
      'luukhopman/football-logos current 2026/27 top-25 league membership',
      'Wikidata current league membership (P118) and logo (P154)',
      'JoseArroyave/football-logos SVG catalogue for high-quality crest resolution and small-association fallback',
    ],
  };

  writeJson(OUTPUTS, finalRows);
  writeJson(META_OUTPUTS, meta);
  console.log(`[clubs] Saved ${finalRows.length} logo entries.`);
  console.log(`[clubs] Top-division mapped: ${topDivisionRows.length} clubs across ${topDivisionCountries.size}/${ASSOCIATIONS.length} domestic UEFA associations.`);
  if (topDivisionMissing.length) console.log(`[clubs] Association fallbacks: ${topDivisionMissing.join(', ')}`);
  if (missingAssociations.length) console.warn(`[clubs] Missing logo coverage: ${missingAssociations.join(', ')}`);
}

main().catch((error) => {
  console.error(`[clubs] Sync failed: ${error.stack || error.message}`);
  process.exit(1);
});
