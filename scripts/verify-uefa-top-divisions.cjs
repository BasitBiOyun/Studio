const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const USER_AGENT = 'BasitBiOyun-Studio/1.0 UEFA-top-flight-verifier';
const CATALOGUE_FILES = [
  path.join(ROOT, 'src/data/clubs_catalogue.json'),
  path.join(ROOT, 'public/clubs_catalogue.json'),
];
const META_FILES = [
  path.join(ROOT, 'src/data/clubs_catalogue_meta.json'),
  path.join(ROOT, 'public/clubs_catalogue_meta.json'),
];

const DIVISIONS = [
  {
    country: 'Albania', league: 'Kategoria Superiore',
    source: 'https://fshf.org/sq/abissnet-superiore-2026-2027-percaktohen-datat-dhe-oraret-e-5-javeve-te-para-te-sezonit-te-ri/',
    teams: ['Vllaznia', 'Skënderbeu', 'Partizani', 'Teuta', 'Laçi', 'AF Elbasani', 'Dinamo City', 'FK Vora', 'Egnatia', 'Tirana'],
  },
  {
    country: 'Gibraltar', league: 'Gibraltar Football League',
    source: 'https://www.gibraltarfa.com/competitions/gibraltar-football-league-26-27-3395567',
    teams: ['College 1975 FC', 'Europa FC', 'Europa Point FC', 'FC Hound Dogs', 'FC Magpies', 'Glacis United FC', 'Lions Gibraltar FC', 'Lynx FC', 'Lincoln Red Imps FC', 'Mons Calpe FC', "St Joseph's FC"],
  },
  {
    country: 'Lithuania', league: 'TOPLYGA',
    source: 'https://www.lff.lt/lygos/a-lyga-kuri-remia-topsport-2026/',
    teams: ['FK Kauno Žalgiris', 'FK Žalgiris', 'FK Sūduva', 'FC Džiugas', 'FK TransINVEST', 'FK Banga', 'FC Hegelmann', 'FK Panevėžys', 'FA Šiauliai'],
  },
  {
    country: 'Moldova', league: 'Liga 7777',
    source: 'https://www.fmf.md/noutate/17655/liga-7777-a-fost-stabilit-programul-meciurilor-din-faza-i-editia-202627?lang=en',
    teams: ['FC Petrocub', 'FC Sheriff', 'FC Zimbru', 'FC Milsami', 'CSF Bălți', 'Dacia Buiucani', 'FC Politehnica UTM', 'FC Real Sireți'],
  },
  {
    country: 'Montenegro', league: 'Meridianbet 1. CFL',
    source: 'https://fscg.me/takmicenja/meridianbet-1-cfl/',
    teams: ['FK Jezero', 'FK Mornar', 'OFK Mladost DG', 'FK Otrant-Olympic', 'OFK Petrovac', 'FK Bokelj', 'FK Sutjeska Nikšić', 'FK Budućnost Podgorica', 'FK Dečić', 'FK Arsenal Tivat'],
  },
  {
    country: 'North Macedonia', league: 'First MFL',
    source: 'https://www.ffm.mk/en/',
    teams: ['FK Vardar', 'FK Bregalnica Štip', 'KF Shkëndija', 'FK Skopje', 'FC Struga Trim-Lum', 'KF Shkëndija Aračinovo', 'FK Sileks', 'KF Bashkimi 1947', 'GFK Tikveš 1930', 'KF Arsimi 1973'],
  },
  {
    country: 'Northern Ireland', league: 'NIFL Premiership',
    source: 'https://www.nifootballleague.com/about-us/',
    teams: ['Ballymena United', 'Bangor', 'Carrick Rangers', 'Cliftonville', 'Coleraine', 'Crusaders', 'Dungannon Swifts', 'Glentoran', 'Limavady United', 'Larne', 'Linfield', 'Portadown'],
  },
  {
    country: 'Wales', league: 'Cymru Premier',
    source: 'https://faw.cymru/cymru-leagues/cymru-premier/',
    teams: ['Airbus UK Broughton', 'Ammanford', 'Barry Town United', 'Briton Ferry Llansawel', 'Caernarfon Town', 'Cambrian United', 'Cardiff Met', 'Colwyn Bay', "Connah's Quay Nomads", 'Flint Town United', 'Haverfordwest County', 'Holywell Town', 'Llandudno', 'Penybont', 'The New Saints', 'Trefelin'],
  },
];

const ALIASES = {
  'AF Elbasani': ['Elbasani', 'KF Elbasani'],
  'Laçi': ['Laci', 'KF Laçi'],
  'FK Vora': ['Vora'],
  'FC Magpies': ["Bruno's Magpies", 'Brunos Magpies', 'FCB Magpies'],
  'Glacis United FC': ['Glacis United', 'Glacis Utd'],
  'Lions Gibraltar FC': ['Lions Gibraltar', 'Lions Gib'],
  'Mons Calpe FC': ['Mons Calpe SC', 'Mons Calpe'],
  "St Joseph's FC": ['St Joseph’s FC', 'St Josephs FC', 'St Joseph’s'],
  'FK Kauno Žalgiris': ['Kauno Žalgiris', 'Kauno Zalgiris'],
  'FK Žalgiris': ['Žalgiris Vilnius', 'Zalgiris Vilnius'],
  'FK Sūduva': ['Sūduva', 'Suduva'],
  'FC Džiugas': ['Džiugas', 'Dziugas'],
  'FK TransINVEST': ['TransINVEST', 'TransInvest'],
  'FK Banga': ['Banga Gargždai', 'Banga'],
  'FC Hegelmann': ['Hegelmann', 'Hegelmann Litauen'],
  'FK Panevėžys': ['Panevėžys', 'Panevezys'],
  'FA Šiauliai': ['Šiauliai', 'Siauliai'],
  'FC Petrocub': ['Petrocub Hîncești', 'Petrocub Hincesti', 'Petrocub'],
  'FC Sheriff': ['Sheriff Tiraspol', 'Sheriff'],
  'FC Zimbru': ['Zimbru Chișinău', 'Zimbru Chisinau', 'Zimbru'],
  'FC Milsami': ['Milsami Orhei', 'Milsami'],
  'CSF Bălți': ['FC Bălți', 'Balti', 'Bălți'],
  'Dacia Buiucani': ['CSCT Buiucani', 'Buiucani'],
  'FC Politehnica UTM': ['Politehnica UTM'],
  'FC Real Sireți': ['Real Sireți', 'Real Sireti'],
  'FK Jezero': ['Jezero'],
  'FK Mornar': ['Mornar Bar', 'Mornar'],
  'OFK Mladost DG': ['OFK Mladost Lob.bet', 'Mladost DG', 'Mladost Donja Gorica'],
  'FK Otrant-Olympic': ['Otrant-Olympic', 'Otrant Olympic'],
  'OFK Petrovac': ['Petrovac'],
  'FK Bokelj': ['Bokelj Kotor', 'Bokelj'],
  'FK Sutjeska Nikšić': ['Sutjeska Nikšić', 'Sutjeska Niksic', 'Sutjeska'],
  'FK Budućnost Podgorica': ['Budućnost Podgorica', 'Buducnost Podgorica', 'Budućnost'],
  'FK Dečić': ['Dečić', 'Decic'],
  'FK Arsenal Tivat': ['Arsenal Tivat', 'Arsenal'],
  'FK Vardar': ['Vardar Skopje', 'Vardar'],
  'FK Bregalnica Štip': ['Bregalnica Štip', 'Bregalnica Stip', 'Bregalnica'],
  'KF Shkëndija': ['Shkëndija Tetovo', 'Shkendija Tetovo', 'Shkëndija'],
  'FK Skopje': ['Skopje'],
  'FC Struga Trim-Lum': ['Struga Trim-Lum', 'Struga'],
  'KF Shkëndija Aračinovo': ['Shkëndija Aračinovo', 'Shkendija Aracinovo'],
  'FK Sileks': ['Sileks Kratovo', 'Sileks'],
  'KF Bashkimi 1947': ['Bashkimi 1947', 'Bashkimi Kumanovo', 'Bashkimi'],
  'GFK Tikveš 1930': ['Tikveš 1930', 'Tikves 1930', 'Tikveš'],
  'KF Arsimi 1973': ['Arsimi 1973', 'Aresimi 1973', 'Arsimi'],
  'Cardiff Met': ['Cardiff Metropolitan University', 'Cardiff Metropolitan University FC'],
  'Cambrian United': ['Cambrian & Clydach Vale', 'Cambrian United FC'],
  "Connah's Quay Nomads": ['Connah’s Quay Nomads', "Connah's Quay Nomads FC"],
  'The New Saints': ['The New Saints FC', 'TNS'],
  'Trefelin': ['Trefelin BGC', 'Trefelin BGC FC'],
};

const SUFFIXES = new Set(['fc', 'afc', 'cf', 'sc', 'fk', 'kf', 'ofk', 'gfk', 'club', 'football', 'futbol']);

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

function core(value) {
  return normalize(value).split(' ').filter((token) => token && !SUFFIXES.has(token)).join(' ');
}

function namesFor(name) {
  return [name, ...(ALIASES[name] || [])];
}

function requestJson(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { Accept: 'application/json', 'User-Agent': USER_AGENT }, timeout: timeoutMs }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        requestJson(new URL(res.headers.location, url).toString(), timeoutMs).then(resolve, reject);
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`HTTP ${res.statusCode}`));
        try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
      });
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writeJson(files, value) {
  const payload = `${JSON.stringify(value, null, 2)}\n`;
  for (const file of files) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, payload, 'utf8');
  }
}

function nameScore(candidate, aliases) {
  const n = normalize(candidate);
  const c = core(candidate);
  let best = 0;
  for (const alias of aliases) {
    const an = normalize(alias);
    const ac = core(alias);
    if (n === an) best = Math.max(best, 120);
    else if (c && ac && c === ac) best = Math.max(best, 105);
    else if (n.includes(an) || an.includes(n)) best = Math.max(best, 75);
    else if (ac.length >= 5 && (c.includes(ac) || ac.includes(c))) best = Math.max(best, 60);
  }
  return best;
}

function existingLogo(rows, country, name) {
  const aliases = namesFor(name);
  const candidates = rows.filter((row) => row.country === country && row.logoUrl);
  const ranked = candidates.map((row) => ({ row, score: nameScore(row.name, aliases) })).filter((item) => item.score >= 75).sort((a, b) => b.score - a.score);
  if (!ranked.length) return null;
  return { url: ranked[0].row.logoUrl, source: ranked[0].row.logoSource || 'existing-catalogue', wikidataId: ranked[0].row.wikidataId || null };
}

function collectFotmobTeams(json) {
  const found = [];
  const groups = Array.isArray(json?.teamSuggest) ? json.teamSuggest : [];
  for (const group of groups) {
    for (const option of group?.options || []) {
      const payload = option?.payload || option;
      const id = payload?.id || payload?.teamId;
      const name = payload?.name || payload?.teamName || option?.name;
      if (id && name) found.push({ id: String(id), name: String(name) });
    }
  }
  if (found.length) return found;

  const walk = (value) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(walk); return; }
    const id = value.id || value.teamId;
    const name = value.name || value.teamName;
    const type = normalize(value.type || value.suggestionType || '');
    if (id && name && (!type || type.includes('team'))) found.push({ id: String(id), name: String(name) });
    Object.values(value).forEach(walk);
  };
  walk(json);
  return found;
}

async function fotmobLogo(country, name) {
  const aliases = namesFor(name);
  for (const term of aliases.slice(0, 3)) {
    try {
      const url = `https://apigw.fotmob.com/searchapi/suggest?term=${encodeURIComponent(term)}&lang=en`;
      const json = await requestJson(url, 7000);
      const ranked = collectFotmobTeams(json)
        .map((team) => ({ ...team, score: nameScore(team.name, aliases) }))
        .filter((team) => team.score >= 75)
        .sort((a, b) => b.score - a.score);
      if (ranked.length) {
        return {
          url: `https://images.fotmob.com/image_resources/logo/teamlogo/${encodeURIComponent(ranked[0].id)}.png`,
          source: 'fotmob-teamlogo',
          fotmobId: ranked[0].id,
          wikidataId: null,
        };
      }
    } catch (error) {
      console.warn(`[clubs] FotMob lookup ${country}/${name}/${term}: ${error.message}`);
    }
  }
  return null;
}

async function wikipediaLogo(country, name) {
  const aliases = namesFor(name);
  try {
    const query = `\"${name}\" football club ${country}`;
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=0&gsrlimit=6&gsrsearch=${encodeURIComponent(query)}&prop=pageimages&piprop=original%7Cthumbnail&pithumbsize=1000&pilimit=6`;
    const json = await requestJson(url, 6000);
    const ranked = Object.values(json?.query?.pages || {})
      .map((page) => ({ page, score: nameScore(page.title || '', aliases), url: page.original?.source || page.thumbnail?.source || null }))
      .filter((item) => item.score >= 60 && item.url)
      .sort((a, b) => b.score - a.score);
    if (ranked.length) return { url: ranked[0].url, source: 'wikipedia-pageimage', wikidataId: null };
  } catch (error) {
    console.warn(`[clubs] Wikipedia lookup ${country}/${name}: ${error.message}`);
  }
  return null;
}

async function resolveLogo(rows, country, name) {
  return existingLogo(rows, country, name) || await fotmobLogo(country, name) || await wikipediaLogo(country, name);
}

function dedupe(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!row?.name || !row?.country || !row?.logoUrl) continue;
    const key = `${normalize(row.country)}|${normalize(row.name)}`;
    const existing = map.get(key);
    if (!existing || (existing.scope !== 'top-division' && row.scope === 'top-division')) map.set(key, row);
  }
  return [...map.values()];
}

async function main() {
  const baseRows = readJson(CATALOGUE_FILES[0], []);
  const meta = readJson(META_FILES[0], {});
  if (!Array.isArray(baseRows) || baseRows.length < 350) throw new Error(`Base catalogue invalid (${baseRows.length}).`);

  let rows = [...baseRows];
  const coverage = [];
  const unresolved = [];

  for (const division of DIVISIONS) {
    const sourceRows = [...rows];
    rows = rows.filter((row) => !(row.country === division.country && row.scope === 'top-division'));
    const resolved = [];
    const missing = [];

    for (const name of division.teams) {
      const logo = await resolveLogo(sourceRows, division.country, name);
      if (!logo?.url) {
        missing.push(name);
        unresolved.push(`${division.country}: ${name}`);
        continue;
      }
      rows.push({
        id: logo.wikidataId || (logo.fotmobId ? `fotmob:${logo.fotmobId}` : `manual:${normalize(division.country)}:${normalize(name)}`),
        name,
        country: division.country,
        league: division.league,
        leagueId: null,
        wikidataId: logo.wikidataId || null,
        fotmobId: logo.fotmobId || null,
        fallbackLogoUrl: null,
        wikidataLogoUrl: null,
        logoUrl: logo.url,
        logoSource: logo.source,
        scope: 'top-division',
        topDivisionSource: 'federation-verified-2026-27-roster',
        rosterSourceUrl: division.source,
      });
      resolved.push(name);
    }

    coverage.push({ association: division.country, league: division.league, expected: division.teams.length, resolved: resolved.length, missing, sourceUrl: division.source });
    console.log(`[clubs] verified ${division.country}: ${resolved.length}/${division.teams.length}`);
  }

  if (unresolved.length) throw new Error(`Unresolved current top-flight logos (${unresolved.length}): ${unresolved.join(' | ')}`);

  rows = dedupe(rows).sort((a, b) => a.country.localeCompare(b.country) || String(a.league || '').localeCompare(String(b.league || '')) || a.name.localeCompare(b.name));
  const represented = new Set(rows.map((row) => row.country));
  const topRows = rows.filter((row) => row.scope === 'top-division');
  const topCountries = new Set(topRows.map((row) => row.country));
  if (topCountries.size !== 54) throw new Error(`Expected 54 domestic UEFA top divisions, got ${topCountries.size}.`);

  const nextMeta = {
    ...meta,
    generatedAt: new Date().toISOString(),
    totalEntries: rows.length,
    topDivisionEntries: topRows.length,
    representedAssociations: represented.size,
    topDivisionAssociations: topCountries.size,
    topDivisionMissing: [],
    fallbackAssociations: (meta.fallbackAssociations || []).filter((item) => !DIVISIONS.some((division) => division.country === item.association)),
    manualTopDivisionCoverage: coverage,
    manualTopDivisionVerifiedAt: new Date().toISOString(),
    sources: [...new Set([...(meta.sources || []), 'Federation/league verified 2026/27 rosters for the eight manually pinned top divisions', 'FotMob team IDs used only as a crest-resolution fallback where the checked-in SVG/Wikidata catalogue has no crest'])],
  };

  writeJson(CATALOGUE_FILES, rows);
  writeJson(META_FILES, nextMeta);
  console.log(`[clubs] COMPLETE: ${topCountries.size}/54 domestic UEFA associations, ${topRows.length} top-flight club logo rows.`);
}

main().catch((error) => {
  console.error(`[clubs] ${error.stack || error.message}`);
  process.exit(1);
});
