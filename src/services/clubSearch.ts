export interface ClubSearchResult {
  id: string;
  name: string;
  country: string;
  league: string;
  logoUrl: string | null;
}

export async function searchWikidataClubs(query: string): Promise<ClubSearchResult[]> {
  const sparql = `SELECT ?club ?clubLabel ?countryLabel ?leagueLabel ?logo WHERE {
  SERVICE wikibase:mwapi {
      bd:serviceParam wikibase:endpoint "www.wikidata.org";
                      wikibase:api "EntitySearch";
                      mwapi:search "${query.replace(/(["\\])/g, '\\$1')}";
                      mwapi:language "en".
      ?club wikibase:apiOutputItem mwapi:item.
  }
  { ?club wdt:P31/wdt:P279* wd:Q476028 } UNION { ?club wdt:P31/wdt:P279* wd:Q178885 }
  OPTIONAL { ?club wdt:P154 ?logo . }
  OPTIONAL { ?club wdt:P17 ?country . }
  OPTIONAL { ?club wdt:P118 ?league . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 10`;

  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'BasitBiOyun/1.0 (yunusemreyilmaz93@gmail.com)'
      }
    });
    
    if (!res.ok) {
      throw new Error("Wikidata query failed");
    }
    
    const data = await res.json();
    return data.results.bindings.map((b: any) => ({
      id: b.club.value.split('/').pop() || '',
      name: b.clubLabel.value,
      country: b.countryLabel ? b.countryLabel.value : '',
      league: b.leagueLabel ? b.leagueLabel.value : '',
      logoUrl: b.logo ? b.logo.value + '?width=400' : null,
    }));
  } catch (error) {
    console.error("Wikidata search error:", error);
    return [];
  }
}

export async function fetchLogoAsDataUrl(url: string): Promise<string> {
  try {
    // Wikipedia Commons images don't always send CORS headers on standard requests from browser directly. 
    // They usually do, but wait. Commons DOES support CORS if requested properly, but we can also use a corsproxy just in case.
    // Let's use corsproxy if needed, or directly. MediaWiki Commons has CORS enabled for * 
    const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, { mode: 'cors', cache: 'force-cache' });
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to fetch image as blob:", error);
    return url;
  }
}
