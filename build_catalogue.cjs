const https = require('https');
const fs = require('fs');

const leagues = [
  "Q9448", "Q19498", "Q324867", "Q8226", "Q15804", "Q13394", 
  "Q485970", "Q496924", "Q482931", "Q275267", "Q734455", "Q223789", "Q282458"
];

const query = `
SELECT DISTINCT ?club ?clubLabel ?countryLabel ?leagueLabel ?logo ?qid WHERE {
  VALUES ?league { ${leagues.map(l => `wd:${l}`).join(' ')} }
  ?club wdt:P118 ?league .
  ?club wdt:P154 ?logo .
  OPTIONAL { ?club wdt:P17 ?country . }
  BIND(REPLACE(STR(?club), ".*Q", "Q") AS ?qid)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
`;

const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;

https.get(url, { headers: { 'User-Agent': 'BasitBiOyunBot/1.0 (yunusemreyilmaz93@gmail.com)' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const clubs = json.results.bindings.map(b => ({
        id: b.qid.value,
        name: b.clubLabel.value,
        country: b.countryLabel ? b.countryLabel.value : '',
        league: b.leagueLabel ? b.leagueLabel.value : '',
        logoUrl: b.logo.value
      }));
      fs.mkdirSync('src/data', { recursive: true });
      fs.writeFileSync('src/data/clubs_catalogue.json', JSON.stringify(clubs, null, 2));
      console.log(`Saved ${clubs.length} clubs.`);
    } catch (e) {
      console.log("Error", e.message, data.substring(0, 100));
    }
  });
});
