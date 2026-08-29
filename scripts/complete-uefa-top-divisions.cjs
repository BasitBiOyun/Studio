const https = require('https');
const fs = require('fs');
const path = require('path');

const USER_AGENT = 'BasitBiOyun-Studio/1.0 top-division-completer';
const ROOT = process.cwd();
const CATALOGUE_FILES = [
  path.join(ROOT, 'src/data/clubs_catalogue.json'),
  path.join(ROOT, 'public/clubs_catalogue.json'),
];
const META_FILES = [
  path.join(ROOT, 'src/data/clubs_catalogue_meta.json'),
  path.join(ROOT, 'public/clubs_catalogue_meta.json'),
];

// These eight associations are the ones the generic Wikidata/P118 pass could not
// reliably classify. Their current senior top-flight membership is therefore
// pinned to federation/league sources and refreshed deliberately when seasons change.
const MANUAL_TOP_DIVISIONS = [
  {
    country: 'Albania',
    league: 'Kategoria Superiore',
    sourceUrl: 'https://fshf.org/sq/abissnet-superiore-2026-2027-percaktohen-datat-dhe-oraret-e-5-javeve-te-para-te-sezonit-te-ri/',
    teams: [
      ['Vllaznia', 'KF Vllaznia'],
      ['Skënderbeu', 'KF Skënderbeu'],
      ['Partizani', 'FK Partizani'],
      ['Teuta', 'KF Teuta'],
      ['Laçi', 'KF Laçi', 'Laci'],
      ['AF Elbasani', 'Elbasani', 'KF Elbasani'],
      ['Dinamo City', 'FK Dinamo City', 'Dinamo Tirana'],
      ['FK Vora', 'Vora'],
      ['Egnatia', 'KF Egnatia'],
      ['Tirana', 'KF Tirana'],
    ],
  },
  {
    country: 'Gibraltar',
    league: 'Gibraltar Football League',
    sourceUrl: 'https://www.gibraltarfa.com/competitions/gibraltar-football-league-26-27-3395567',
    teams: [
      ['College 1975 FC', 'College 1975'],
      ['Europa FC', 'Europa'],
      ['Europa Point FC', 'Europa Point'],
      ['FC Hound Dogs', 'Hound Dogs'],
      ['FC Magpies', 'Bruno’s Magpies', 'Brunos Magpies', 'FCB Magpies'],
      ['Glacis United FC', 'Glacis United', 'Glacis Utd'],
      ['Lions Gibraltar FC', 'Lions Gibraltar', 'Lions Gib'],
      ['Lynx FC', 'Lynx'],
      ['Lincoln Red Imps FC', 'Lincoln Red Imps'],
      ['Mons Calpe FC', 'Mons Calpe SC', 'Mons Calpe'],
      ["St Joseph's FC", 'St Joseph’s FC', 'St Josephs FC', 'St Joseph’s'],
    ],
  },
  {
    country: 'Lithuania',
    league: 'TOPLYGA',
    sourceUrl: 'https://www.lff.lt/lygos/a-lyga-kuri-remia-topsport-2026/',
    teams: [
      ['FK Kauno Žalgiris', 'Kauno Žalgiris', 'Kauno Zalgiris'],
      ['FK Žalgiris', 'Žalgiris Vilnius', 'Zalgiris Vilnius'],
      ['FK Sūduva', 'Sūduva', 'Suduva'],
      ['FC Džiugas', 'Džiugas', 'Dziugas'],
      ['FK TransINVEST', 'TransINVEST', 'TransInvest'],
      ['FK Banga', 'Banga Gargždai', 'Banga'],
      ['FC Hegelmann', 'Hegelmann', 'Hegelmann Litauen'],
      ['FK Panevėžys', 'Panevėžys', 'Panevezys'],
      ['FA Šiauliai', 'Šiauliai', 'Siauliai'],
    ],
  },
  {
    country: 'Moldova',
    league: 'Liga 7777',
    sourceUrl: 'https://www.fmf.md/noutate/17655/liga-7777-a-fost-stabilit-programul-meciurilor-din-faza-i-editia-202627?lang=en',
    teams: [
      ['FC Petrocub', 'Petrocub Hîncești', 'Petrocub Hincesti', 'Petrocub'],
      ['FC Sheriff', 'Sheriff Tiraspol', 'Sheriff'],
      ['FC Zimbru', 'Zimbru Chișinău', 'Zimbru Chisinau', 'Zimbru'],
      ['FC Milsami', 'Milsami Orhei', 'Milsami'],
      ['CSF Bălți', 'FC Bălți', 'Balti', 'Bălți'],
      ['Dacia Buiucani', 'CSCT Buiucani', 'Buiucani'],
      ['FC Politehnica UTM', 'Politehnica UTM'],
      ['FC Real Sireți', 'Real Sireți', 'Real Sireti'],
    ],
  },
  {
    country: 'Montenegro',
    league: 'Meridianbet 1. CFL',
    sourceUrl: 'https://fscg.me/takmicenja/meridianbet-1-cfl/',
    teams: [
      ['FK Jezero', 'Jezero'],
      ['FK Mornar', 'Mornar Bar', 'Mornar'],
      ['OFK Mladost DG', 'OFK Mladost Lob.bet', 'Mladost DG', 'Mladost Donja Gorica'],
      ['FK Otrant-Olympic', 'Otrant-Olympic', 'Otrant Olympic'],
      ['OFK Petrovac', 'Petrovac'],
      ['FK Bokelj', 'Bokelj Kotor', 'Bokelj'],
      ['FK Sutjeska Nikšić', 'Sutjeska Nikšić', 'Sutjeska Niksic', 'Sutjeska'],
      ['FK Budućnost Podgorica', 'Budućnost Podgorica', 'Buducnost Podgorica', 'Budućnost'],
      ['FK Dečić', 'Dečić', 'Decic'],
      ['FK Arsenal Tivat', 'Arsenal Tivat', 'Arsenal'],
    ],
  },
  {
    country: 'North Macedonia',
    league: 'First MFL',
    sourceUrl: 'https://www.ffm.mk/en/',
    teams: [
      ['FK Vardar', 'Vardar Skopje', 'Vardar'],
      ['FK Bregalnica Štip', 'Bregalnica Štip', 'Bregalnica Stip', 'Bregalnica'],
      ['KF Shkëndija', 'Shkëndija Tetovo', 'Shkendija Tetovo', 'Shkëndija'],
      ['FK Skopje', 'Skopje'],
      ['FC Struga Trim-Lum', 'Struga Trim-Lum', 'Struga'],
      ['KF Shkëndija Aračinovo', 'Shkëndija Aračinovo', 'Shkendija Aracinovo'],
      ['FK Sileks', 'Sileks Kratovo', 'Sileks'],
      ['KF Bashkimi 1947', 'Bashkimi 1947', 'Bashkimi Kumanovo', 'Bashkimi'],
      ['GFK Tikveš 1930', 'Tikveš 1930', 'Tikves 1930', 'Tikveš'],
      ['KF Arsimi 1973', 'Arsimi 1973', 'Aresimi 1973', 'Arsimi'],
    ],
  },
  {
    country: 'Northern Ireland',
    league: 'NIFL Premiership',
    sourceUrl: 'https://www.nifootballleague.com/about-us/',
    teams: [
      ['Ballymena United', 'Ballymena United FC'],
      ['Bangor', 'Bangor FC'],
      ['Carrick Rangers', 'Carrick Rangers FC'],
      ['Cliftonville', 'Cliftonville FC'],
      ['Coleraine', 'Coleraine FC'],
      ['Crusaders', 'Crusaders FC'],
      ['Dungannon Swifts', 'Dungannon Swifts FC'],
      ['Glentoran', 'Glentoran FC'],
      ['Limavady United', 'Limavady United FC'],
      ['Larne', 'Larne FC'],
      ['Linfield', 'Linfield FC'],
      ['Portadown', 'Portadown FC'],
    ],
  },
  {
    country: 'Wales',
    league: 'Cymru Premier',
    sourceUrl: 'https://faw.cymru/cymru-leagues/cymru-premier/',
    teams: [
      ['Airbus UK Broughton', 'Airbus UK', 'Airbus UK Broughton FC'],
      ['Ammanford', 'Ammanford AFC'],
      ['Barry Town United', 'Barry Town United FC'],
      ['Briton Ferry Llansawel', 'Briton Ferry Llansawel AFC'],
      ['Caernarfon Town', 'Caernarfon Town FC'],
      ['Cambrian United', 'Cambrian United FC', 'Cambrian & Clydach Vale'],
      ['Cardiff Met', 'Cardiff Metropolitan University', 'Cardiff Metropolitan University FC'],
      ['Colwyn Bay', 'Colwyn Bay FC'],
      ["Connah's Quay Nomads", 'Connah’s Quay Nomads', "Connah's Quay Nomads FC"],
      ['Flint Town United', 'Flint Town United FC'],
      ['Haverfordwest County', 'Haverfordwest County AFC'],
      ['Holywell Town', 'Holywell Town FC'],
      ['Llandudno', 'Llandudno FC'],
      ['Penybont', 'Penybont FC'],
      ['The New Saints', 'The New Saints FC', 'TNS'],
      ['Trefelin', 'Trefelin BGC', 'Trefelin BGC FC'],
    ],
  },
];

const CLUB_SUFFIXES = new Set(['fc', 'cf', 'afc', 'sc', 'fk', 'sk', 'nk', 'jk', 'ac', 'bc', 'sv', 'ss', 'club', 'football', 'futbol']);

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

function coreName(value) {
  return normalize(value)
    .split(' ')
    .filter((token) => token && !CLUB_SUFFIXES.has(token))
    .join(' ');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestJson(url, attempts = 4) {
  return new Promise((resolve, reject) => {
    const run = (attempt) => {
      const req = https.get(url, {
        headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
        timeout: 25000,
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
              const retryAfter = Number.parseInt(String(res.headers['retry-after'] || ''), 10);
              const delay = Number.isFinite(retryAfter) ? retryAfter * 1000 : (res.statusCode === 429 ? 3500 * attempt : 900 * attempt);
              setTimeout(() => run(attempt + 1), Math.max(1200, delay));
              return;
            }
            reject(new Error(`HTTP ${res.statusCode}: ${url}`));
            return;
          }
          try { resolve(JSON.parse(body)); }
          catch (error) { reject(new Error(`Invalid JSON from ${url}: ${error.message}`)); }
        });
      });
      req.on('timeout', () => req.destroy(new Error(`Timeout: ${url}`)));
      req.on('error', (error) => {
        if (attempt < attempts) setTimeout(() => run(attempt + 1), 900 * attempt);
        else reject(error);
      });
    };
    run(1);
  });
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function writeJson(files, value) {
  const payload = `${JSON.stringify(value, null, 2)}\n`;
  for (const file of files) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, payload, 'utf8');
  }
}

function aliasesFor(team) {
  return team.map((value) => String(value).trim()).filter(Boolean);
}

function existingLogoFor(rows, country, aliases) {
  const candidates = rows.filter((row) => row.country === country && row.logoUrl);
  const normalizedAliases = new Set(aliases.map(normalize));
  const exact = candidates.find((row) => normalizedAliases.has(normalize(row.name)));
  if (exact) return { url: exact.logoUrl, source: exact.logoSource || 'existing-catalogue', wikidataId: exact.wikidataId || null };

  const aliasCores = new Set(aliases.map(coreName).filter((value) => value.length >= 4));
  const coreMatches = candidates.filter((row) => aliasCores.has(coreName(row.name)));
  if (coreMatches.length === 1) {
    const row = coreMatches[0];
    return { url: row.logoUrl, source: row.logoSource || 'existing-catalogue', wikidataId: row.wikidataId || null };
  }
  return null;
}

function titleScore(title, aliases) {
  const normalizedTitle = normalize(title);
  const coreTitle = coreName(title);
  if (/women|ladies|reserve|reserves|academy|youth|under 21|under 23| ii$| b$/.test(normalizedTitle)) return -1000;
  let score = 0;
  for (const alias of aliases) {
    const normalizedAlias = normalize(alias);
    const coreAlias = coreName(alias);
    if (normalizedTitle === normalizedAlias) score = Math.max(score, 120);
    else if (coreTitle && coreAlias && coreTitle === coreAlias) score = Math.max(score, 105);
    else if (normalizedTitle.includes(normalizedAlias) || normalizedAlias.includes(normalizedTitle)) score = Math.max(score, 75);
    else if (coreAlias.length >= 5 && (coreTitle.includes(coreAlias) || coreAlias.includes(coreTitle))) score = Math.max(score, 60);
  }
  return score;
}

async function wikipediaLogoFor(country, aliases) {
  const searchTerms = [`\"${aliases[0]}\" football club ${country}`, `${aliases[0]} ${country} football`];
  for (const term of searchTerms) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=0&gsrlimit=8&gsrsearch=${encodeURIComponent(term)}&prop=pageimages&piprop=original%7Cthumbnail&pithumbsize=1000&pilimit=8`;
    try {
      const json = await requestJson(url, 3);
      const pages = Object.values(json?.query?.pages || {});
      const ranked = pages
        .map((page) => ({
          page,
          score: titleScore(page.title || '', aliases),
          url: page.original?.source || page.thumbnail?.source || null,
        }))
        .filter((item) => item.score >= 60 && item.url)
        .sort((a, b) => b.score - a.score);
      if (ranked.length) {
        return { url: ranked[0].url, source: 'wikipedia-pageimage', wikidataId: null };
      }
    } catch (error) {
      console.warn(`[clubs] Wikipedia lookup failed for ${aliases[0]}: ${error.message}`);
    }
    await sleep(350);
  }
  return null;
}

function wikidataCandidateScore(candidate, country, aliases) {
  const labelScore = titleScore(candidate.label || '', aliases);
  if (labelScore < 0) return -1000;
  const description = normalize(candidate.description || '');
  let score = labelScore;
  if (/football club|association football|soccer club|football team/.test(description)) score += 35;
  if (description.includes(normalize(country))) score += 15;
  if (/women|womens|futsal|youth|reserve/.test(description)) score -= 100;
  return score;
}

async function wikidataLogoFor(country, aliases) {
  try {
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&type=item&limit=10&search=${encodeURIComponent(aliases[0])}`;
    const search = await requestJson(searchUrl, 3);
    const ranked = (Array.isArray(search.search) ? search.search : [])
      .map((candidate) => ({ candidate, score: wikidataCandidateScore(candidate, country, aliases) }))
      .filter((item) => item.score >= 80)
      .sort((a, b) => b.score - a.score);

    for (const { candidate } of ranked.slice(0, 3)) {
      await sleep(300);
      const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=${encodeURIComponent(candidate.id)}&props=claims`;
      const entityJson = await requestJson(entityUrl, 3);
      const entity = entityJson?.entities?.[candidate.id];
      const logoClaim = entity?.claims?.P154?.find((claim) => claim?.mainsnak?.datavalue?.value);
      const fileName = logoClaim?.mainsnak?.datavalue?.value;
      if (!fileName) continue;
      return {
        url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`,
        source: 'wikidata-p154-manual',
        wikidataId: candidate.id,
      };
    }
  } catch (error) {
    console.warn(`[clubs] Wikidata manual lookup failed for ${aliases[0]}: ${error.message}`);
  }
  return null;
}

async function resolveLogo(rows, country, team) {
  const aliases = aliasesFor(team);
  const existing = existingLogoFor(rows, country, aliases);
  if (existing) return existing;

  const wikipedia = await wikipediaLogoFor(country, aliases);
  if (wikipedia) return wikipedia;

  await sleep(350);
  return wikidataLogoFor(country, aliases);
}

function removeExistingTeamAliases(rows, country, aliases) {
  const normalizedAliases = new Set(aliases.map(normalize));
  const cores = new Set(aliases.map(coreName).filter((value) => value.length >= 4));
  return rows.filter((row) => {
    if (row.country !== country) return true;
    if (normalizedAliases.has(normalize(row.name))) return false;
    if (cores.has(coreName(row.name))) return false;
    return true;
  });
}

function dedupe(rows) {
  const byKey = new Map();
  for (const row of rows) {
    if (!row?.country || !row?.name || !row?.logoUrl) continue;
    const key = `${normalize(row.country)}|${normalize(row.name)}`;
    const existing = byKey.get(key);
    if (!existing || (existing.scope !== 'top-division' && row.scope === 'top-division')) byKey.set(key, row);
  }
  return [...byKey.values()];
}

async function main() {
  let rows = readJson(CATALOGUE_FILES[0], []);
  const meta = readJson(META_FILES[0], {});
  if (!Array.isArray(rows) || rows.length < 350) throw new Error('Base club catalogue is missing or unexpectedly small.');

  const coverage = [];
  const unresolved = [];

  for (const division of MANUAL_TOP_DIVISIONS) {
    let resolvedCount = 0;
    const missing = [];

    for (const team of division.teams) {
      const aliases = aliasesFor(team);
      const canonicalName = aliases[0];
      const logo = await resolveLogo(rows, division.country, team);
      if (!logo?.url) {
        missing.push(canonicalName);
        unresolved.push(`${division.country}: ${canonicalName}`);
        continue;
      }

      rows = removeExistingTeamAliases(rows, division.country, aliases);
      rows.push({
        id: logo.wikidataId || `manual:${normalize(division.country)}:${normalize(canonicalName)}`,
        name: canonicalName,
        country: division.country,
        league: division.league,
        leagueId: null,
        wikidataId: logo.wikidataId || null,
        fallbackLogoUrl: null,
        wikidataLogoUrl: logo.source.startsWith('wikidata') ? logo.url : null,
        logoUrl: logo.url,
        logoSource: logo.source,
        scope: 'top-division',
        topDivisionSource: 'federation-verified-manual-roster',
        rosterSourceUrl: division.sourceUrl,
      });
      resolvedCount += 1;
      await sleep(120);
    }

    coverage.push({
      association: division.country,
      league: division.league,
      expected: division.teams.length,
      resolved: resolvedCount,
      missing,
      sourceUrl: division.sourceUrl,
    });
    console.log(`[clubs] ${division.country}: ${resolvedCount}/${division.teams.length} current top-flight clubs have logos.`);
  }

  if (unresolved.length) {
    throw new Error(`Manual top-division logo coverage incomplete (${unresolved.length}): ${unresolved.join(' | ')}`);
  }

  rows = dedupe(rows).sort((a, b) => a.country.localeCompare(b.country) || String(a.league || '').localeCompare(String(b.league || '')) || a.name.localeCompare(b.name));
  const representedAssociations = new Set(rows.map((row) => row.country));
  const topDivisionRows = rows.filter((row) => row.scope === 'top-division');
  const topDivisionAssociations = new Set(topDivisionRows.map((row) => row.country));

  const nextMeta = {
    ...meta,
    generatedAt: new Date().toISOString(),
    totalEntries: rows.length,
    topDivisionEntries: topDivisionRows.length,
    representedAssociations: representedAssociations.size,
    topDivisionAssociations: topDivisionAssociations.size,
    fallbackAssociations: (meta.fallbackAssociations || []).filter((item) => !MANUAL_TOP_DIVISIONS.some((division) => division.country === item.association)),
    topDivisionMissing: [],
    manualTopDivisionCoverage: coverage,
    manualTopDivisionVerifiedAt: new Date().toISOString(),
    sources: [
      ...(Array.isArray(meta.sources) ? meta.sources : []),
      'Federation/league verified 2026/27 rosters for Albania, Gibraltar, Lithuania, Moldova, Montenegro, North Macedonia, Northern Ireland and Wales',
      'Wikipedia page images and Wikidata P154 only as logo-resolution fallbacks for federation-verified club names',
    ].filter((value, index, array) => array.indexOf(value) === index),
  };

  if (topDivisionAssociations.size < 54) {
    const missingCountries = (meta.topDivisionMissing || []).filter((country) => !MANUAL_TOP_DIVISIONS.some((division) => division.country === country));
    throw new Error(`Top-division association coverage is ${topDivisionAssociations.size}/54. Remaining: ${missingCountries.join(', ') || 'unknown'}`);
  }

  writeJson(CATALOGUE_FILES, rows);
  writeJson(META_FILES, nextMeta);
  console.log(`[clubs] UEFA top-division coverage complete: ${topDivisionAssociations.size}/54 domestic associations, ${topDivisionRows.length} current top-flight logo rows.`);
}

main().catch((error) => {
  console.error(`[clubs] ${error.stack || error.message}`);
  process.exit(1);
});
