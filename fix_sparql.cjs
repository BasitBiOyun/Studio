const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'services', 'clubSearch.ts');
let code = fs.readFileSync(file, 'utf8');

// Update SPARQL query to get actual thumbnail path using MediaWiki API if possible, or just the direct URL.
// But wait! Special:FilePath redirects! Fetch with CORS won't follow the redirect if the origin is restricted or if the target lacks CORS.
// Wikidata's logo values are `http://commons.wikimedia.org/wiki/Special:FilePath/...`
// We can construct the actual Wikimedia Commons thumbnail URL instead of relying on the redirect.
// The true upload path is calculated by md5 hashing the filename.
// But there's an easier way: MediaWiki API can return the image info directly, OR we can just use corsproxy.

// Let's use corsproxy.io because Wikipedia commons redirects might break CORS for blobs
code = code.replace(
  "const res = await fetch(url, { mode: 'cors', cache: 'force-cache' });",
  "const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, { mode: 'cors', cache: 'force-cache' });"
);

fs.writeFileSync(file, code);
