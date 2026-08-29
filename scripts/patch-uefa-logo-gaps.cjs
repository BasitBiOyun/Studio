const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const USER_AGENT = 'Mozilla/5.0 (compatible; BasitBiOyun-Studio/1.0; +https://studio-xi-three-95.vercel.app/)';
const FILES = [
  path.join(ROOT, 'src/data/clubs_catalogue.json'),
  path.join(ROOT, 'public/clubs_catalogue.json'),
];

// Only clubs that the generic checked-in SVG/Wikidata catalogue did not resolve
// during the 2026/27 federation-roster verification pass belong here.
const GAPS = {
  Albania: ['AF Elbasani', 'FK Vora'],
  Gibraltar: ['College 1975 FC', 'Europa FC', 'Europa Point FC', 'FC Hound Dogs', 'FC Magpies', 'Glacis United FC', 'Lions Gibraltar FC', 'Lynx FC', 'Mons Calpe FC', "St Joseph's FC"],
  Moldova: ['FC Petrocub', 'FC Sheriff', 'FC Zimbru', 'FC Milsami', 'CSF Bălți', 'Dacia Buiucani', 'FC Politehnica UTM', 'FC Real Sireți'],
  Montenegro: ['FK Jezero', 'FK Mornar', 'OFK Mladost DG', 'FK Otrant-Olympic', 'OFK Petrovac', 'FK Bokelj', 'FK Sutjeska Nikšić', 'FK Budućnost Podgorica', 'FK Dečić', 'FK Arsenal Tivat'],
  'North Macedonia': ['FK Vardar', 'FK Bregalnica Štip', 'FK Skopje', 'FC Struga Trim-Lum', 'FK Sileks', 'KF Bashkimi 1947', 'GFK Tikveš 1930', 'KF Arsimi 1973'],
  'Northern Ireland': ['Limavady United'],
  Wales: ['Ammanford', 'Cambrian United', 'Trefelin'],
};

const ALIASES = {
  'FK Vora': ['KF Vora', 'Vora'],
  'FC Magpies': ["FC Bruno's Magpies", "Bruno's Magpies", 'Brunos Magpies'],
  'Glacis United FC': ['Glacis United'],
  'Lions Gibraltar FC': ['Lions Gibraltar'],
  'Mons Calpe FC': ['Mons Calpe'],
  "St Joseph's FC": ['St Josephs FC', "St Joseph's"],
  'FC Petrocub': ['FC Petrocub Hîncesti', 'FC Petrocub Hincesti', 'Petrocub'],
  'FC Sheriff': ['Sheriff Tiraspol', 'Sheriff'],
  'FC Zimbru': ['FC Zimbru Chişinău', 'FC Zimbru Chisinau', 'Zimbru Chisinau'],
  'FC Milsami': ['FC Milsami Orhei', 'Milsami Orhei'],
  'CSF Bălți': ['FC Bălți', 'FC Balti', 'Balti'],
  'FC Politehnica UTM': ['FC Politehnica', 'Politehnica UTM'],
  'FC Real Sireți': ['Real Sireți', 'Real Sireti'],
  'FK Mornar': ['FK Mornar Bar', 'Mornar Bar'],
  'OFK Mladost DG': ['Mladost DG'],
  'OFK Petrovac': ['Petrovac'],
  'FK Sutjeska Nikšić': ['Sutjeska Nikšić', 'FK Sutjeska Niksic'],
  'FK Budućnost Podgorica': ['Budućnost Podgorica', 'FK Buducnost Podgorica'],
  'FK Dečić': ['FK Dečić Tuzi', 'Decic Tuzi'],
  'FK Arsenal Tivat': ['Arsenal Tivat'],
  'FK Vardar': ['Vardar Skopje', 'Vardar'],
  'FK Bregalnica Štip': ['Bregalnica Štip', 'Bregalnica Stip'],
  'FC Struga Trim-Lum': ['Struga Trim-Lum', 'Struga'],
  'FK Sileks': ['Sileks Kratovo', 'Sileks'],
  'KF Bashkimi 1947': ['Bashkimi 1947', 'Bashkimi Kumanovo'],
  'GFK Tikveš 1930': ['Tikveš 1930', 'Tikves 1930', 'Tikveš'],
  'KF Arsimi 1973': ['Arsimi 1973', 'Arsimi'],
  'Cambrian United': ['Cambrian & Clydach Vale', 'Cambrian United FC'],
  'Trefelin': ['Trefelin FC', 'Trefelin BGC'],
};

const SUFFIXES = new Set(['fc', 'afc', 'cf', 'sc', 'fk', 'kf', 'ofk', 'gfk', 'club', 'football', 'futbol']);

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}
function core(value) {
  return normalize(value).split(' ').filter((token) => token && !SUFFIXES.has(token)).join(' ');
}
function namesFor(name) { return [name, ...(ALIASES[name] || [])]; }
function scoreName(candidate, names) {
  const n = normalize(candidate); const c = core(candidate); let best = 0;
  for (const alias of names) {
    const an = normalize(alias); const ac = core(alias);
    if (n === an) best = Math.max(best, 120);
    else if (c && ac && c === ac) best = Math.max(best, 105);
    else if (n.includes(an) || an.includes(n)) best = Math.max(best, 78);
    else if (ac.length >= 5 && (c.includes(ac) || ac.includes(c))) best = Math.max(best, 62);
  }
  return best;
}

function requestJson(url, timeout = 7000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { Accept: 'application/json', 'User-Agent': USER_AGENT, Referer: 'https://www.sofascore.com/' }, timeout }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume(); requestJson(new URL(res.headers.location, url).toString(), timeout).then(resolve, reject); return;
      }
      let body = ''; res.setEncoding('utf8'); res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`HTTP ${res.statusCode}`));
        try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
      });
    });
    req.on('timeout', () => req.destroy(new Error('timeout'))); req.on('error', reject);
  });
}

function collectTeams(json) {
  const teams = [];
  const add = (obj, typeHint = '') => {
    if (!obj || typeof obj !== 'object') return;
    const entity = obj.entity && typeof obj.entity === 'object' ? obj.entity : obj;
    const type = normalize(obj.type || entity.type || typeHint);
    const id = entity.id || entity.teamId;
    const name = entity.name || entity.teamName;
    if (id && name && (!type || type.includes('team'))) teams.push({ id: String(id), name: String(name) });
  };
  for (const result of json?.results || []) add(result, result?.type);
  const walk = (value, depth = 0) => {
    if (!value || typeof value !== 'object' || depth > 5) return;
    if (Array.isArray(value)) { value.forEach((item) => walk(item, depth + 1)); return; }
    add(value);
    Object.values(value).forEach((item) => walk(item, depth + 1));
  };
  if (!teams.length) walk(json);
  return [...new Map(teams.map((team) => [`${team.id}|${team.name}`, team])).values()];
}

async function findSofascoreTeam(country, canonicalName) {
  const aliases = namesFor(canonicalName);
  for (const term of aliases.slice(0, 4)) {
    try {
      const json = await requestJson(`https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(term)}`);
      const ranked = collectTeams(json)
        .map((team) => ({ ...team, score: scoreName(team.name, aliases) }))
        .filter((team) => team.score >= 78)
        .sort((a, b) => b.score - a.score);
      if (ranked.length) return ranked[0];
    } catch (error) {
      console.warn(`[clubs] Sofascore lookup ${country}/${canonicalName}/${term}: ${error.message}`);
    }
  }
  return null;
}

async function main() {
  let rows = JSON.parse(fs.readFileSync(FILES[0], 'utf8'));
  const unresolved = [];
  let added = 0;

  for (const [country, names] of Object.entries(GAPS)) {
    for (const name of names) {
      const match = await findSofascoreTeam(country, name);
      if (!match) { unresolved.push(`${country}: ${name}`); continue; }
      const aliases = namesFor(name);
      rows = rows.filter((row) => !(row.country === country && aliases.some((alias) => scoreName(row.name, [alias]) >= 105)));
      rows.push({
        id: `sofascore:${match.id}`,
        name,
        country,
        league: null,
        leagueId: null,
        wikidataId: null,
        sofascoreId: match.id,
        logoUrl: `https://api.sofascore.app/api/v1/team/${encodeURIComponent(match.id)}/image`,
        logoSource: 'sofascore-team-image',
        scope: 'crest-resolution-cache',
        topDivisionSource: null,
      });
      console.log(`[clubs] Sofascore crest: ${country} / ${name} -> ${match.name} (${match.id})`);
      added += 1;
    }
  }

  if (unresolved.length) {
    console.warn(`[clubs] Sofascore unresolved (${unresolved.length}): ${unresolved.join(' | ')}`);
  }

  rows.sort((a, b) => a.country.localeCompare(b.country) || String(a.name).localeCompare(String(b.name)));
  const payload = `${JSON.stringify(rows, null, 2)}\n`;
  for (const file of FILES) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, payload, 'utf8'); }
  console.log(`[clubs] Sofascore crest cache added ${added} entries; verifier will decide whether coverage is complete.`);
}

main().catch((error) => { console.error(`[clubs] ${error.stack || error.message}`); process.exit(1); });
