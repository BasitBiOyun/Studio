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
  'Successful Take-Ons': 'Başarılı Çalım', 'Touches in Opp. Box': 'Rakip Ceza Sahasında Topla Buluşma',
  'Passes into Box': 'Ceza Sahasına Pas', 'Shot-Creating Actions': 'Şut Yaratan Aksiyon',
  'Field Tilt': 'Saha Eğimi', 'Match Rating': 'Maç Puanı', 'Goal': 'Gol', 'Assist': 'Asist',
};

const DEFAULT_CONTENT_TR: Record<string, string> = {
  'Explosive transition winger who attacks space, carries the ball forward and creates chances from wide areas.': 'Boş alanı agresif kullanan, topu ileri taşıyan ve geniş alanlardan fırsat üreten patlayıcı bir geçiş hücumcusu.',
  'Most dangerous when attacking open space from wide areas. Can play on either flank, drive inside with speed and turn carries into chances. Better in transition than in slower, crowded attacking phases.': 'En etkili olduğu anlar genişten açık alana hücum ettiği sekanslar. İki kanatta da oynayabilir, hızla içe kat edip top taşımalarını pozisyona çevirebilir. Geçiş oyununda, yerleşik ve kalabalık hücuma göre daha etkili.',
  'Acceleration & open-field threat': 'Hızlanma ve açık alan tehdidi',
  '1v1 attacking ability': 'Bire bir hücum kalitesi',
  'Progressive carrying': 'İleri yönlü top taşıma',
  'Chance creation': 'Fırsat yaratma',
  'Final decision-making': 'Final bölgesi kararları',
  'Dribble efficiency': 'Dripling verimliliği',
  'End product consistency': 'Son aksiyon istikrarı',
  'U21 WINGERS • METRIC PER 90 BREAKDOWN': 'U21 KANATLAR • 90 DAKİKA BAŞINA KARŞILAŞTIRMA',
  'Sonko generates significantly more passing volume and creative expected threat, while Nuamah excels in isolated 1v1 touch volume and penalty box entries.': 'Sonko daha yüksek pas hacmi ve yaratıcı tehdit üretirken Nuamah bire bir aksiyonlar ile ceza sahasına girişlerde öne çıkıyor.',
  'Total agreement reached between clubs. Player completed medical tests and signed long-term contract.': 'Kulüpler arasında anlaşma sağlandı. Oyuncu sağlık kontrollerini tamamladı ve uzun süreli sözleşmesini imzaladı.',
  '€75M fixed fee payable in 3 installments': '€75M sabit bonservis • 3 taksit',
  '€10M performance & Champions League add-ons': '€10M performans ve Şampiyonlar Ligi bonusları',
  '10% future sell-on clause included': 'Sonraki satıştan %10 pay maddesi',
  'WEDNESDAY, 11 MARCH 2026': 'ÇARŞAMBA, 11 MART 2026',
  '1st in La Liga': 'La Liga 1. sırada',
  '1st in Premier League': 'Premier League 1. sırada',
  'Vinicius Jr vs Kyle Walker / Rest-Defense Transition vs High Positional Circulation': 'Vinicius Jr - Kyle Walker / Rest-defans geçişi - yüksek pozisyonel dolaşım',
  'Rest-defense management against Madrid transitions': 'Madrid geçişlerine karşı rest-defans yönetimi',
  'Central midfield overloading through Rodri & De Bruyne': 'Rodri ve De Bruyne üzerinden merkez orta saha üstünlüğü',
  'Attacking the half-spaces behind full-backs': 'Beklerin arkasındaki yarı alanlara hücum',
  'Arsenal suffocated City with an aggressive 4-4-2 mid-block and punished defensive transitions through Saka on the right flank.': 'Arsenal agresif 4-4-2 orta blokla City’nin oyununu daralttı ve savunma geçişlerini sağ kanatta Saka üzerinden cezalandırdı.',
  'High press forced 14 defensive turnovers in opponent half': 'Yüksek pres rakip yarı sahada 14 top kaybı zorladı',
  'Saka 1v1 dominance created 4 key chances from wide channels': 'Saka’nın bire bir üstünlüğü geniş koridorlardan 4 önemli fırsat yarattı',
  'Saliba & Gabriel eliminated box delivery to Haaland': 'Saliba ve Gabriel, Haaland’a ceza sahası içindeki servisleri büyük ölçüde kesti',
  'CENTRAL OVERLOAD & HALF-SPACE DYNAMICS': 'MERKEZ ÜSTÜNLÜĞÜ VE YARI ALAN DİNAMİKLERİ',
  '3-4-2-1 / 3-2-4-1 IN POSSESSION': 'TOPA SAHİPKEN 3-4-2-1 / 3-2-4-1',
  'Inverted Pocket Receivers': 'İçe Konumlanan Cep Oyuncuları',
  'Dual number 10s sit directly behind opposing midfield line to draw central defenders out of shape.': 'İki 10 numara rakip orta saha hattının arkasına yerleşerek stoperleri yapıdan çıkmaya zorluyor.',
  'Wide Wing-Back Isolations': 'Kanat Bekleri Genişte İzole Etme',
  'Maximum pitch width created by wing-backs holding touchline until deep third penetration.': 'Kanat bekleri son bölgeye girişe kadar çizgiyi tutarak saha genişliğini maksimuma çıkarıyor.',
  'Rest-Defense 3+2 Shape': '3+2 Rest-Defans Yapısı',
  '3 central defenders plus 2 holding midfielders maintain structural stability during sustained pressure.': 'Üç stoper ve iki merkez orta saha, uzun hücumlarda yapısal güvenliği koruyor.',
  'Extreme patience in circulation until vertical passing lanes into half-spaces open up.': 'Yarı alanlara dikey pas koridoru açılana kadar top dolaşımında yüksek sabır.',
  'Quick 1-2 touch combinations in central third': 'Merkez bölgede hızlı bir ve iki dokunuşlu kombinasyonlar',
  'Trigger counter-press within 3 seconds of possession loss': 'Top kaybından sonraki 3 saniyede karşı presi tetikle',
  'Overload left half-space to isolate right wing-back 1v1': 'Sağ kanat bekini bire bir bırakmak için sol yarı alanda üstünlük kur',
  'Pass Accuracy Under High Pressure in Final Third': 'Son Bölgede Yüksek Baskı Altında Pas İsabeti',
  '#1 IN EUROPE': 'AVRUPA’DA 1.',
  'CREATIVE EFFICIENCY': 'YARATICI VERİMLİLİK',
  'MIN. 1200 MINUTES PLAYED • 2025/26 TOP 5 LEAGUES': 'EN AZ 1200 DAKİKA • 2025/26 AVRUPA’NIN 5 BÜYÜK LİGİ',
  'Unrivaled press resistance and passing precision under congested penalty box pressure makes him the most reliable progressive playmaker in the modern game.': 'Baskıya dayanıklılığı ve kalabalık final bölgesindeki pas hassasiyeti, onu ileri yönlü oyunda son derece güvenilir bir oyun kurucu haline getiriyor.',
  'TOP 5 CHANCE CREATORS': 'EN İYİ 5 FIRSAT YARATICI',
  "U21 PLAYERS IN EUROPE'S TOP 5 LEAGUES": 'AVRUPA’NIN 5 BÜYÜK LİGİNDE U21 OYUNCULAR',
  '2025/26 SEASON • MIN 900 MINUTES': '2025/26 SEZONU • EN AZ 900 DAKİKA',
  'Source: Opta & StatsBomb data indexed across Europe top leagues.': 'Kaynak: Avrupa’nın önde gelen liglerinden Opta ve StatsBomb verileri.',
  'In football, simplicity is the most difficult thing. When you control space, you control the tempo, and when you control tempo, the opponent plays your game.': 'Futbolda en zor şey sadeliktir. Alanı kontrol ettiğinizde tempoyu, tempoyu kontrol ettiğinizde ise rakibin oynadığı oyunu kontrol edersiniz.',
  'Manager, Manchester City FC': 'Teknik Direktör, Manchester City FC',
  'TACTICAL PHILOSOPHY': 'TAKTİK FELSEFE',
  'Champions League Press Conference • February 2026': 'Şampiyonlar Ligi Basın Toplantısı • Şubat 2026',
  'When you control space, you control the tempo.': 'Alanı kontrol ettiğinizde tempoyu kontrol edersiniz.',
  'THE TACTICAL EVOLUTION OF REST-DEFENSE': 'REST-DEFANSIN TAKTİK EVRİMİ',
  'How Elite European Teams Engineered Counter-Pressing Dominance In 2026': 'Avrupa’nın elit takımları 2026’da karşı pres üstünlüğünü nasıl kurdu?',
  'EDITORIAL TACTICAL SERIES • 8-PART BREAKDOWN': 'TAKTİK ANALİZ SERİSİ • 8 BÖLÜM',
  'Tactical Analysis by @BasitBiOyun': 'Taktik Analiz: @BasitBiOyun',
  'The 3-2 and 2-3 rest defense architectures': '3-2 ve 2-3 rest-defans yapıları',
  'Counter-pressing triggers and 3-second recovery rules': 'Karşı pres tetikleyicileri ve 3 saniyelik geri kazanım kuralı',
  'Preventing central transition channels': 'Merkez geçiş koridorlarını kapatma',
  '2ND LEG (AGG: 4-2)': '2. MAÇ (TOPLAM: 4-2)',
  'Total Shots (on target)': 'Toplam Şut (isabetli)',
  '1 Goal • 1 Assist • 7 Successful Dribbles': '1 Gol • 1 Asist • 7 Başarılı Çalım',
  'Devastating transition execution in the final third sent Real Madrid through to the quarter-finals.': 'Real Madrid, son bölgedeki etkili geçiş hücumlarıyla çeyrek finale yükseldi.',
  '1ST PLACE • 64 PTS': '1. SIRA • 64 PUAN',
  'Dynamic Rest-Defense & Positional Half-Space Play': 'Dinamik Rest-Defans ve Pozisyonel Yarı Alan Oyunu',
  'xG Created /90': 'Üretilen xG /90',
  'xGA Conceded /90': 'Yenilen xGA /90',
  'PPDA (Pressing Intensity)': 'PPDA (Pres Yoğunluğu)',
  'Field Tilt % (Territory)': 'Saha Eğimi %',
  '1st in League': 'Ligde 1.',
  '2nd in League': 'Ligde 2.',
  'Sustained final third territory and field tilt': 'Son bölgede sürekli alan hakimiyeti ve yüksek saha eğimi',
  'Elite rest-defense and counter-pressing recovery': 'Üst düzey rest-defans ve karşı presle topu geri kazanma',
  'Dual number 10 interplay in half-spaces': 'Yarı alanlarda iki 10 numaranın bağlantı oyunu',
  'Vulnerability against direct aerial switches behind wing-backs': 'Kanat beklerin arkasına atılan doğrudan çapraz toplara karşı kırılganlık',
  'High line vulnerability on rare breakdown of counter-press': 'Karşı pres kırıldığında yüksek savunma çizgisinin açık vermesi',
  'The most tactically cohesive side in Europe, dominating territory through rigorous rest-defense and fluid half-space rotations.': 'Rest-defans disiplini ve akıcı yarı alan rotasyonlarıyla alanı domine eden, Avrupa’nın taktik açıdan en bütünlüklü takımlarından biri.',
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
  if (DEFAULT_CONTENT_TR[text]) return DEFAULT_CONTENT_TR[text];

  let result = replaceExactOrSegments(text, COUNTRY_TR);
  result = replaceExactOrSegments(result, POSITION_TR);
  result = replaceExactOrSegments(result, CONTROLLED_TR);

  result = result
    .replace(/\bUNTIL\s+(\d{4})\b/gi, "$1'E KADAR")
    .replace(/\b(\d+)-YEAR CONTRACT\b/gi, '$1 YILLIK SÖZLEŞME')
    .replace(/\b(\d+)\s+YEARS?\b/gi, '$1 YIL')
    .replace(/\bADD-ONS\b/gi, 'BONUSLAR')
    .replace(/\bGOALS?\b/gi, 'GOL')
    .replace(/\bASSISTS?\b/gi, 'ASİST')
    .replace(/\bPTS\b/gi, 'PUAN')
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
