export type OutputLanguage = 'en' | 'tr';

const STORAGE_KEY = 'basitbioyun-studio-output-language';
const listeners = new Set<() => void>();
let memoryLanguage: OutputLanguage = 'en';

const EXACT_TR: Record<string, string> = {
  Nat: 'Ülke',
  Age: 'Yaş',
  Foot: 'Ayak',
  Height: 'Boy',
  'Right Foot': 'Sağ',
  'Left Foot': 'Sol',
  Right: 'Sağ',
  Left: 'Sol',
  Both: 'İki Ayak',
  W: 'G',
  D: 'B',
  L: 'M',
  'Role & Tactical Profile': 'Rol ve Taktik Profil',
  'Key Strengths': 'Güçlü Yönler',
  'Development Areas': 'Gelişim Alanları',
  'Scout Verdict': 'Scout Değerlendirmesi',
  'Head-to-Head • Analytical Comparison': 'Bire Bir • Analitik Karşılaştırma',
  'ANALYTICAL VERDICT': 'ANALİTİK DEĞERLENDİRME',
  'Departing Club': 'Ayrıldığı Kulüp',
  'New Club': 'Yeni Kulüp',
  'Transfer Fee': 'Bonservis',
  'Contract Terms': 'Sözleşme',
  'KEY TACTICAL BATTLE': 'KİLİT TAKTİK EŞLEŞME',
  'TACTICAL DECIDER': 'TAKTİK ANAHTAR',
  'TACTICAL DECIDERS': 'TAKTİK ANAHTARLAR',
  'Match Overview': 'Maçın Genel Görünümü',
  'Key Match Metrics': 'Temel Maç Verileri',
  'Key Takeaways': 'Öne Çıkan Noktalar',
  'PLAYER OF THE MATCH': 'MAÇIN OYUNCUSU',
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
  'Expected Goals (xG)': 'Beklenen Gol (xG)',
  'Possession %': 'Topa Sahip Olma %',
  'Key Passes /90': 'Kilit Pas /90',
  'Progressive Carries /90': 'İleri Taşıma /90',
  'Shots /90': 'Şut /90',
  'In Possession': 'Topa Sahipken',
  'Out of Possession': 'Topsuz Oyunda',
  'Defensive Transition': 'Savunma Geçişi',
  'Attacking Transition': 'Hücum Geçişi',
};

const PHRASE_TR: Array<[RegExp, string]> = [
  [/\bPrepared for\b/gi, 'Hazırlandı'],
  [/\bVisual by\b/gi, 'Tasarım'],
  [/\bAnalysis by\b/gi, 'Analiz'],
  [/\bManager:\s*/gi, 'Teknik Direktör: '],
  [/\bHead Coach\b/gi, 'Teknik Direktör'],
  [/\bTACTICAL DEEP DIVE\b/gi, 'TAKTİK DERİN ANALİZ'],
  [/\bIN POSSESSION\b/gi, 'TOPA SAHİPKEN'],
  [/\bOUT OF POSSESSION\b/gi, 'TOPSUZ OYUNDA'],
  [/\bDEFENSIVE TRANSITION\b/gi, 'SAVUNMA GEÇİŞİ'],
  [/\bATTACKING TRANSITION\b/gi, 'HÜCUM GEÇİŞİ'],
  [/\bMATCH ANALYSIS\b/gi, 'MAÇ ANALİZİ'],
  [/\bMATCH PREVIEW\b/gi, 'MAÇ ÖNİZLEMESİ'],
  [/\bPOST-MATCH ANALYSIS\b/gi, 'MAÇ SONU ANALİZİ'],
  [/\bSEASON\b/gi, 'SEZONU'],
  [/\bMINUTES\b/gi, 'DAKİKA'],
  [/\bPRINCIPLE\s+(\d+)\b/gi, 'PRENSİP $1'],
  [/\b(\d+)\s+Y\/O\b/gi, '$1 YAŞ'],
];

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
    const translated = translateCardText(current, language);
    if (translated !== current) textNode.nodeValue = translated;
  }
}
