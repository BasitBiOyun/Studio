import { localizeFootballValue } from './footballLocale';

export type OutputLanguage = 'en' | 'tr';

const STORAGE_KEY = 'basitbioyun-studio-output-language';
const listeners = new Set<() => void>();
let memoryLanguage: OutputLanguage = 'en';

const EXACT_TR: Record<string, string> = {
  Nat: 'Ülke',
  Age: 'Yaş',
  Foot: 'Ayak',
  Height: 'Boy',
  'Right Foot': 'Sağ Ayak',
  'Left Foot': 'Sol Ayak',
  Right: 'Sağ',
  Left: 'Sol',
  Both: 'İki Ayak',
  W: 'G',
  D: 'B',
  L: 'M',
  'Role & Tactical Profile': 'Rol ve Taktik Profil',
  'Key Strengths': 'Güçlü Yönler',
  'KEY STRENGTHS': 'GÜÇLÜ YÖNLER',
  'Development Areas': 'Gelişim Alanları',
  'DEVELOPMENT AREAS': 'GELİŞİM ALANLARI',
  'Scout Verdict': 'Genel Değerlendirme',
  'Scouting Report': 'Scout Raporu',
  'PLAYER SCOUTING REPORT': 'OYUNCU SCOUT RAPORU',
  'Head-to-Head • Analytical Comparison': 'Bire Bir • Analitik Karşılaştırma',
  'ANALYTICAL VERDICT': 'ANALİTİK DEĞERLENDİRME',
  'Departing Club': 'Ayrıldığı Kulüp',
  'New Club': 'Yeni Kulüp',
  'From Club': 'Ayrıldığı Kulüp',
  'To Club': 'Yeni Kulüp',
  'Transfer Fee': 'Bonservis',
  'Contract Terms': 'Sözleşme',
  'TRANSFER AGREEMENT': 'TRANSFER',
  'AGREEMENT REACHED': 'TRANSFER',
  'TRANSFER UPDATE': 'TRANSFER',
  'OFFICIAL TRANSFER': 'TRANSFER',
  'HERE WE GO!': 'TRANSFER',
  'HERE WE GO': 'TRANSFER',
  'OLD CLUB': 'ESKİ KULÜP',
  'NEW CLUB': 'YENİ KULÜP',
  'Agreement completed': 'Anlaşma tamamlandı',
  'Medical passed': 'Sağlık kontrolü tamamlandı',
  'Total agreement reached between clubs.': 'Kulüpler arasında anlaşma sağlandı.',
  'KEY TACTICAL BATTLE': 'KİLİT TAKTİK EŞLEŞME',
  'TACTICAL DECIDER': 'TAKTİK ANAHTAR',
  'TACTICAL DECIDERS': 'TAKTİK ANAHTARLAR',
  'Match Overview': 'Maçın Genel Görünümü',
  'Key Match Metrics': 'Temel Maç Verileri',
  'Key Takeaways': 'Öne Çıkan Noktalar',
  'PLAYER OF THE MATCH': 'MAÇIN OYUNCUSU',
  'MAN OF THE MATCH': 'MAÇIN OYUNCUSU',
  'CORE TACTICAL CONCEPT': 'ANA TAKTİK FİKİR',
  'CORE PRINCIPLES': 'ANA PRENSİPLER',
  'EXECUTION TRIGGERS': 'UYGULAMA TETİKLEYİCİLERİ',
  'DATA INTERPRETATION': 'VERİ YORUMU',
  'Leaderboard Rankings': 'Sıralama',
  Rank: 'Sıra',
  'Player & Club': 'Oyuncu ve Kulüp',
  'KEY TAKEAWAY': 'ANA ÇIKARIM',
  'FULL TIME': 'MAÇ SONU',
  'FULL TIME SUMMARY': 'MAÇ SONU ÖZETİ',
  'TACTICAL PROFILE': 'TAKTİK PROFİL',
  'VULNERABILITIES': 'ZAYIF NOKTALAR',
  'MATCHDAY PREVIEW': 'MAÇ ÖNİZLEMESİ',
  'TACTICAL ANALYSIS': 'TAKTİK ANALİZ',
  'TACTICAL TOPIC': 'TAKTİK KONU',
  'STAT HIGHLIGHT': 'ÖNE ÇIKAN İSTATİSTİK',
  'STANDOUT STAT': 'ÖNE ÇIKAN VERİ',
  'TOP 5 RANKING': 'İLK 5 SIRALAMASI',
  LEADERBOARD: 'SIRALAMA',
  'OPINION & INSIGHT': 'GÖRÜŞ VE ANALİZ',
  'Press Conference': 'Basın Toplantısı',
  'EDITORIAL THREAD': 'ANALİZ SERİSİ',
  'Football Editorial Analytics': 'Futbol Analizleri',
  'UEFA Champions League': 'UEFA Şampiyonlar Ligi',
  'UEFA CHAMPIONS LEAGUE': 'UEFA ŞAMPİYONLAR LİGİ',
  'Champions League': 'Şampiyonlar Ligi',
  'CHAMPIONS LEAGUE': 'ŞAMPİYONLAR LİGİ',
  'Quarter Final': 'Çeyrek Final',
  'QUARTER FINAL': 'ÇEYREK FİNAL',
  'Semi Final': 'Yarı Final',
  'SEMI FINAL': 'YARI FİNAL',
  'Expected Goals (xG)': 'Beklenen Gol (xG)',
  'Expected Assists (xA)': 'Beklenen Asist (xA)',
  'Possession %': 'Topa Sahip Olma %',
  'Key Passes /90': 'Kilit Pas /90',
  'Progressive Carries /90': 'İleri Taşıma /90',
  'Shots /90': 'Şut /90',
  'Shots on Target': 'İsabetli Şut',
  'Total Shots': 'Toplam Şut',
  'Pass Accuracy': 'Pas İsabeti',
  'Long Ball Accuracy': 'Uzun Pas İsabeti',
  'In Possession': 'Topa Sahipken',
  'Out of Possession': 'Topsuz Oyunda',
  'Defensive Transition': 'Savunma Geçişi',
  'Attacking Transition': 'Hücum Geçişi',
  'FINAL': 'FİNAL',
  'FINAL THIRD': 'HÜCUM ÜÇÜNCÜ BÖLGESİ',
  'TEAM PROFILE': 'TAKIM PROFİLİ',
  'Strengths': 'Güçlü Yönler',
  'Weaknesses': 'Zayıf Yönler',
  'Manager': 'Teknik Direktör',
  'League': 'Lig',
  'Formation': 'Diziliş',
  'Season': 'Sezon',
  'Competition': 'Organizasyon',
  'Match Date': 'Maç Tarihi',
  'Kickoff': 'Başlama Saati',
  'Venue': 'Stadyum',
};

const PHRASE_TR: Array<[RegExp, string]> = [
  [/\bUEFA\s+CHAMPIONS\s+LEAGUE\b/gi, 'UEFA Şampiyonlar Ligi'],
  [/\bCHAMPIONS\s+LEAGUE\b/gi, 'Şampiyonlar Ligi'],
  [/\bPrepared for\b/gi, 'Hazırlandı'],
  [/\bVisual by\b/gi, 'Tasarım'],
  [/\bAnalysis by\b/gi, 'Analiz'],
  [/\bManager:\s*/gi, 'Teknik Direktör: '],
  [/\bHead Coach\b/gi, 'Teknik Direktör'],
  [/\bPOST-MATCH ANALYSIS\b/gi, 'MAÇ SONU ANALİZİ'],
  [/\bMATCH ANALYSIS\b/gi, 'MAÇ ANALİZİ'],
  [/\bMATCH PREVIEW\b/gi, 'MAÇ ÖNİZLEMESİ'],
  [/\bTACTICAL DEEP DIVE\b/gi, 'TAKTİK DERİN ANALİZ'],
  [/\bIN POSSESSION\b/gi, 'TOPA SAHİPKEN'],
  [/\bOUT OF POSSESSION\b/gi, 'TOPSUZ OYUNDA'],
  [/\bDEFENSIVE TRANSITION\b/gi, 'SAVUNMA GEÇİŞİ'],
  [/\bATTACKING TRANSITION\b/gi, 'HÜCUM GEÇİŞİ'],
  [/\b(\d+)\s+KEY TACTICAL DECIDERS?\b/gi, '$1 TAKTİK ANAHTARI'],
  [/\bMIN\.\s*/gi, 'EN AZ '],
  [/\bSEASON\b/gi, 'SEZONU'],
  [/\bMINUTES\b/gi, 'DAKİKA'],
  [/\bPRINCIPLE\s+(\d+)\b/gi, 'PRENSİP $1'],
  [/\b(\d+)\s+Y\/O\b/gi, '$1 YAŞ'],
  [/\b(\d+)-YEAR CONTRACT\b/gi, '$1 YILLIK SÖZLEŞME'],
  [/\bUNTIL\s+(\d{4})\b/gi, "$1'E KADAR"],
  [/\b(\d+)(?:ST|ND|RD|TH) PLACE\b/gi, '$1. SIRA'],
  [/\bROUND OF 16\b/gi, 'SON 16'],
  [/\bQUARTER(?:\s|-)?FINAL\b/gi, 'ÇEYREK FİNAL'],
  [/\bSEMI(?:\s|-)?FINAL\b/gi, 'YARI FİNAL'],
  [/\bMATCHDAY\s+(\d+)\b/gi, '$1. HAFTA'],
  [/\b1ST IN\b/gi, '1. SIRA •'],
  [/\b2ND IN\b/gi, '2. SIRA •'],
  [/\b3RD IN\b/gi, '3. SIRA •'],
  [/\bTRANSFER AGREEMENT\b/gi, 'TRANSFER'],
  [/\bAGREEMENT REACHED\b/gi, 'TRANSFER'],
  [/\bHERE WE GO!?\b/gi, 'TRANSFER'],
];

const TURKISH_DISPLAY_WORDS = new Set([
  'lig', 'ligi', 'ligde', 'liginde', 'analiz', 'analizi', 'sezon', 'sezonu',
  'veri', 'verileri', 'oyuncu', 'oyuncunun', 'takım', 'takımın', 'kulüp', 'kulübü',
  'maç', 'maçın', 'gol', 'asist', 'dakika', 'profil', 'profili', 'taktik', 'taktiksel',
  'değerlendirme', 'özet', 'sağ', 'sol', 'ayak', 'yaş', 'boy', 'organizasyon', 'sıra',
  'final', 'yarı', 'çeyrek', 'şampiyonlar', 'performans', 'hücum', 'savunma', 'geçiş',
  'pas', 'şut', 'top', 'saha', 'kanat', 'orta', 'forvet', 'santrfor', 'stoper', 'bek',
  'alan', 'alanları', 'güçlü', 'yönler', 'gelişim', 'başlık', 'rapor', 'istatistik',
]);
const TURKISH_SPECIFIC_CHARS = /[çğıöşüÇĞİÖŞÜ]/u;
const WORD_PATTERN = /\p{L}[\p{L}\p{M}'’.-]*/gu;

function isUppercaseContext(node: Text, root: HTMLElement) {
  let element: HTMLElement | null = node.parentElement;
  while (element && element !== root.parentElement) {
    if (element.classList.contains('uppercase')) return true;
    if (element === root) break;
    element = element.parentElement;
  }
  return false;
}

export function uppercaseLocalizedText(original: string, translated: string): string {
  const originalWords = new Set(
    (original.match(WORD_PATTERN) || []).map((word) => word.toLocaleLowerCase('en-US')),
  );
  const sourceLooksTurkish = TURKISH_SPECIFIC_CHARS.test(original);

  return translated.replace(WORD_PATTERN, (word) => {
    const trKey = word.toLocaleLowerCase('tr-TR');
    if (TURKISH_SPECIFIC_CHARS.test(word) || TURKISH_DISPLAY_WORDS.has(trKey)) {
      return word.toLocaleUpperCase('tr-TR');
    }

    const enKey = word.toLocaleLowerCase('en-US');
    if (originalWords.has(enKey)) {
      return word.toLocaleUpperCase(sourceLooksTurkish ? 'tr-TR' : 'en-US');
    }

    return word.toLocaleUpperCase('tr-TR');
  });
}

export function getOutputLanguage(): OutputLanguage {
  if (typeof window === 'undefined') return memoryLanguage;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'tr' || stored === 'en') {
    memoryLanguage = stored;
  }
  return memoryLanguage;
}

export function setOutputLanguage(language: OutputLanguage) {
  memoryLanguage = language;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, language);
  }
  listeners.forEach((listener) => listener());
}

export function subscribeOutputLanguage(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function translateCardText(text: string, language: OutputLanguage): string {
  if (language !== 'tr' || !text) return text;

  const leading = text.match(/^\s*/)?.[0] || '';
  const trailing = text.match(/\s*$/)?.[0] || '';
  const core = text.trim();
  if (!core) return text;

  let translated = EXACT_TR[core] || core;
  translated = localizeFootballValue(translated);
  for (const [pattern, replacement] of PHRASE_TR) {
    translated = translated.replace(pattern, replacement);
  }

  return `${leading}${translated}${trailing}`;
}

export function localizeCardElement(root: HTMLElement, language: OutputLanguage) {
  if (language !== 'tr' || typeof document === 'undefined') return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node: Node | null = walker.nextNode();

  while (node) {
    const parentTag = node.parentElement?.tagName;
    if (parentTag !== 'SCRIPT' && parentTag !== 'STYLE') {
      textNodes.push(node as Text);
    }
    node = walker.nextNode();
  }

  for (const textNode of textNodes) {
    const current = textNode.nodeValue || '';
    let translated = translateCardText(current, language);
    if (isUppercaseContext(textNode, root)) {
      translated = uppercaseLocalizedText(current, translated);
    }
    if (translated !== current) textNode.nodeValue = translated;
  }
}
