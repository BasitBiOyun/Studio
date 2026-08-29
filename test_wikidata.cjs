const https = require('https');
const query = `
SELECT ?club ?clubLabel ?countryLabel ?leagueLabel ?logo WHERE {
  ?club wdt:P118 wd:Q9448 . # Premier League
  ?club wdt:P154 ?logo .
  OPTIONAL { ?club wdt:P17 ?country . }
  OPTIONAL { ?club wdt:P118 ?league . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 2
`;
const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;

https.get(url, { headers: { 'User-Agent': 'Bot/1.0 (test)' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
