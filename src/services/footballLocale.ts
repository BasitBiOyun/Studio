import { COUNTRIES } from '../constants/countries';

const FIFA_TO_FLAG: Record<string, string> = {
  ENG: 'gb-eng', SCO: 'gb-sct', WAL: 'gb-wls', NIR: 'gb-nir',
  TUR: 'tr', FRA: 'fr', ESP: 'es', POR: 'pt', ITA: 'it', GER: 'de', DEU: 'de',
  NED: 'nl', BEL: 'be', SUI: 'ch', AUT: 'at', DEN: 'dk', SWE: 'se', NOR: 'no',
  FIN: 'fi', POL: 'pl', CZE: 'cz', SVK: 'sk', SVN: 'si', CRO: 'hr', SRB: 'rs',
  BIH: 'ba', GRE: 'gr', ROU: 'ro', BUL: 'bg', HUN: 'hu', UKR: 'ua', RUS: 'ru',
  GEO: 'ge', ARM: 'am', AZE: 'az', ISR: 'il', IRL: 'ie', ISL: 'is', ALB: 'al',
  BRA: 'br', ARG: 'ar', URU: 'uy', COL: 'co', ECU: 'ec', PER: 'pe', CHI: 'cl',
  PAR: 'py', VEN: 've', BOL: 'bo', MEX: 'mx', USA: 'us', CAN: 'ca', CRC: 'cr',
  JAM: 'jm', JPN: 'jp', KOR: 'kr', CHN: 'cn', AUS: 'au', NZL: 'nz',
  GHA: 'gh', NGA: 'ng', CIV: 'ci', SEN: 'sn', MAR: 'ma', ALG: 'dz', TUN: 'tn',
  EGY: 'eg', CMR: 'cm', MLI: 'ml', GUI: 'gn', RSA: 'za', ANG: 'ao', ZAM: 'zm',
  QAT: 'qa', KSA: 'sa', UAE: 'ae', IRN: 'ir', IRQ: 'iq', JOR: 'jo',
};

const COUNTRY_TR: Record<string, string> = {
  Afghanistan: 'Afganistan', Albania: 'Arnavutluk', Algeria: 'Cezayir', Andorra: 'Andorra', Angola: 'Angola',
  Argentina: 'Arjantin', Armenia: 'Ermenistan', Australia: 'Avustralya', Austria: 'Avusturya', Azerbaijan: 'Azerbaycan',
  Belgium: 'Belçika', Bolivia: 'Bolivya', 'Bosnia and Herzegovina': 'Bosna Hersek', Brazil: 'Brezilya', Bulgaria: 'Bulgaristan',
  Cameroon: 'Kamerun', Canada: 'Kanada', Chile: 'Şili', China: 'Çin', Colombia: 'Kolombiya', Croatia: 'Hırvatistan',
  Cyprus: 'Kıbrıs', 'Czech Republic': 'Çekya', Denmark: 'Danimarka', Ecuador: 'Ekvador', Egypt: 'Mısır', England: 'İngiltere',
  Estonia: 'Estonya', Finland: 'Finlandiya', France: 'Fransa', Georgia: 'Gürcistan', Germany: 'Almanya', Ghana: 'Gana',
  Greece: 'Yunanistan', Hungary: 'Macaristan', Iceland: 'İzlanda', Iran: 'İran', Iraq: 'Irak', Ireland: 'İrlanda', Israel: 'İsrail',
  Italy: 'İtalya', 'Ivory Coast': 'Fildişi Sahili', Japan: 'Japonya', Kazakhstan: 'Kazakistan', Kosovo: 'Kosova',
  Mexico: 'Meksika', Montenegro: 'Karadağ', Morocco: 'Fas', Netherlands: 'Hollanda', 'New Zealand': 'Yeni Zelanda',
  Nigeria: 'Nijerya', 'North Macedonia': 'Kuzey Makedonya', 'Northern Ireland': 'Kuzey İrlanda', Norway: 'Norveç',
  Paraguay: 'Paraguay', Peru: 'Peru', Poland: 'Polonya', Portugal: 'Portekiz', Qatar: 'Katar', Romania: 'Romanya', Russia: 'Rusya',
  'Saudi Arabia': 'Suudi Arabistan', Scotland: 'İskoçya', Senegal: 'Senegal', Serbia: 'Sırbistan', Slovakia: 'Slovakya',
  Slovenia: 'Slovenya', 'South Africa': 'Güney Afrika', 'South Korea': 'Güney Kore', Spain: 'İspanya', Sweden: 'İsveç',
  Switzerland: 'İsviçre', Tunisia: 'Tunus', Turkey: 'Türkiye', Ukraine: 'Ukrayna', 'United Arab Emirates': 'Birleşik Arap Emirlikleri',
  'United Kingdom': 'Birleşik Krallık', 'United States': 'ABD', Uruguay: 'Uruguay', Venezuela: 'Venezuela', Wales: 'Galler',
};

const POSITION_TR: Record<string, string> = {
  Goalkeeper: 'Kaleci',
  Defender: 'Savunmacı',
  'Centre Back': 'Stoper',
  'Center Back': 'Stoper',
  Centreback: 'Stoper',
  Centerback: 'Stoper',
  'Left Back': 'Sol Bek',
  'Right Back': 'Sağ Bek',
  'Wing Back': 'Kanat Bek',
  'Left Wing Back': 'Sol Kanat Bek',
  'Right Wing Back': 'Sağ Kanat Bek',
  Midfielder: 'Orta Saha',
  'Defensive Midfielder': 'Defansif Orta Saha',
  'Central Midfielder': 'Merkez Orta Saha',
  'Attacking Midfielder': 'Ofansif Orta Saha',
  'Left Midfielder': 'Sol Orta Saha',
  'Right Midfielder': 'Sağ Orta Saha',
  Winger: 'Kanat',
  'Left Winger': 'Sol Kanat',
  'Right Winger': 'Sağ Kanat',
  Forward: 'Forvet',
  Striker: 'Santrfor',
  'Centre Forward': 'Santrfor',
  'Center Forward': 'Santrfor',
  'Second Striker': 'İkinci Forvet',
};

const CONTROLLED_TR: Record<string, string> = {
  Left: 'Sol', Right: 'Sağ', Both: 'İki Ayak',
  'Left Foot': 'Sol Ayak', 'Right Foot': 'Sağ Ayak', 'Both Feet': 'İki Ayak',
  'HERE WE GO!': 'TRANSFER', 'HERE WE GO': 'TRANSFER',
  'TRANSFER AGREEMENT': 'TRANSFER', 'AGREEMENT REACHED': 'TRANSFER',
  'TRANSFER UPDATE': 'TRANSFER', 'OFFICIAL TRANSFER': 'TRANSFER',
  'Senior club football': 'A Takım Kulüp Maçları',
  'Senior Club Football': 'A Takım Kulüp Maçları',
  'MAN OF THE MATCH': 'MAÇIN OYUNCUSU', 'PLAYER OF THE MATCH': 'MAÇIN OYUNCUSU',
  'Expected Goals': 'Beklenen Gol', 'Expected Assists': 'Beklenen Asist',
  'Shots on Target': 'İsabetli Şut', 'Total Shots': 'Toplam Şut',
  Possession: 'Topa Sahip Olma', 'Big Chances Created': 'Yaratılan Büyük Fırsat',
  'Pass Accuracy': 'Pas İsabeti', 'Long Ball Accuracy': 'Uzun Pas İsabeti',
  'Key Passes': 'Kilit Pas', 'Progressive Carries': 'İleri Taşıma',
};

const REVERSE_COUNTRY_TR = Object.fromEntries(
  Object.entries(COUNTRY_TR).map(([en, tr]) => [tr.toLocaleLowerCase('tr-TR'), en]),
);

function normalizedCountryName(value?: string) {
  if (!value) return '';
  const trimmed = value.trim();
  return REVERSE_COUNTRY_TR[trimmed.toLocaleLowerCase('tr-TR')] || trimmed;
}

export function resolveCountryFlag(nationality?: string, code?: string): string | undefined {
  const direct = (code || '').trim();
  if (direct) {
    const upper = direct.toUpperCase();
    if (FIFA_TO_FLAG[upper]) return FIFA_TO_FLAG[upper];
    const lower = direct.toLowerCase();
    const exact = COUNTRIES.find((country) => country.code === lower || country.flag === lower);
    if (exact) return exact.flag;
  }

  const name = normalizedCountryName(nationality);
  const byName = COUNTRIES.find((country) => country.name.toLowerCase() === name.toLowerCase());
  return byName?.flag;
}

function replaceExactOrSegments(text: string, dictionary: Record<string, string>) {
  if (dictionary[text]) return dictionary[text];
  let result = text;
  const entries = Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length);
  for (const [source, target] of entries) {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), target);
  }
  return result;
}

export function localizeFootballValue(text: string): string {
  if (!text) return text;
  let result = replaceExactOrSegments(text, COUNTRY_TR);
  result = replaceExactOrSegments(result, POSITION_TR);
  result = replaceExactOrSegments(result, CONTROLLED_TR);

  result = result
    .replace(/\bUNTIL\s+(\d{4})\b/gi, "$1'E KADAR")
    .replace(/\b(\d+)-YEAR CONTRACT\b/gi, '$1 YILLIK SÖZLEŞME')
    .replace(/\b(\d+)\s+YEARS?\b/gi, '$1 YIL')
    .replace(/\bADD-ONS\b/gi, 'BONUSLAR')
    .replace(/\bfixed fee\b/gi, 'sabit bonservis')
    .replace(/\bpayable in\b/gi, 'ödenecek')
    .replace(/\binstallments?\b/gi, 'taksit')
    .replace(/\bperformance\b/gi, 'performans')
    .replace(/\bfuture sell-on clause\b/gi, 'sonraki satıştan pay maddesi')
    .replace(/\bcompleted medical tests\b/gi, 'sağlık kontrollerini tamamladı')
    .replace(/\bsigned long-term contract\b/gi, 'uzun süreli sözleşmeyi imzaladı');

  return result;
}

export function turkishUppercase(text: string): string {
  return text.toLocaleUpperCase('tr-TR');
}
