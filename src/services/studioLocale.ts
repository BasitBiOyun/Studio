import { OutputLanguage } from './outputLanguage';

const EXACT_TR: Record<string, string> = {
  'Templates': 'Şablonlar',
  'Data & Text': 'Veri ve Metin',
  'Visuals': 'Görseller',
  'Layout': 'Yerleşim',
  'Guide': 'Rehber',
  'Projects': 'Projeler',
  'Visual Presentation Mode': 'Görsel Sunum Modu',
  'Editorial': 'Editoryal',
  'editorial': 'Editoryal',
  'Data': 'Veri',
  'data': 'Veri',
  'Poster': 'Poster',
  'poster': 'Poster',
  'Aspect Ratio': 'En Boy Oranı',
  '1:1 Square': '1:1 Kare',
  '4:5 Portrait': '4:5 Dikey',
  '16:9 Widescreen': '16:9 Geniş Ekran',
  'X Landscape': 'X Yatay',
  'All': 'Tümü',
  'Scouting & Player': 'Scout ve Oyuncu',
  'Matchday & Team': 'Maç ve Takım',
  'Editorial & News': 'Editoryal ve Haber',
  'Player Scouting Report': 'Oyuncu Scout Raporu',
  'Player Comparison': 'Oyuncu Karşılaştırma',
  'Transfer Graphic': 'Transfer Grafiği',
  'Match Preview': 'Maç Önizlemesi',
  'Match Analysis': 'Maç Analizi',
  'Tactical Analysis': 'Taktik Analiz',
  'Stat Highlight': 'İstatistik Vurgusu',
  'Ranking / Top List': 'Sıralama / Liste',
  'Quote / Opinion Graphic': 'Alıntı / Görüş Grafiği',
  'Thread Cover': 'Seri Kapağı',
  'Match Result': 'Maç Sonucu',
  'Team Profile': 'Takım Profili',
  'Comprehensive single player report with 4 core metrics, strengths, and tactical summary.': 'Temel veriler, güçlü yönler ve taktik özet içeren kapsamlı tek oyuncu raporu.',
  'Direct head-to-head metrics comparison between two players with winner indicators.': 'İki oyuncuyu veriler ve üstünlük göstergeleriyle bire bir karşılaştırır.',
  'Official announcement & Done Deal visual with clubs, transfer fee, and key details.': 'Kulüpler, bonservis ve temel detayları içeren transfer duyuru görseli.',
  'Matchday clash visual with kickoff time, stadium, form guide, and tactical keys.': 'Başlama saati, stadyum, form ve taktik anahtarları içeren maç önü görseli.',
  'Post-match tactical breakdown with scoreline, xG flow, match stats, and key takeaways.': 'Skor, xG, maç verileri ve ana çıkarımlarla maç sonu taktik analizi.',
  'Deep dive tactical breakdown of phases of play, tactical principles, and shape.': 'Oyun fazları, taktik prensipler ve yapıya odaklanan detaylı taktik analiz.',
  'Hero metric showcase focusing on one world-class statistic with context breakdown.': 'Tek bir öne çıkan istatistiği bağlamıyla birlikte vurgular.',
  'Top 5 / Top 10 leaderboards for player metrics with highlighted rank positions.': 'Oyuncu verileri için ilk 5 / ilk 10 sıralamaları ve vurgulanan dereceler.',
  'Editorial statement or post-match coach/player quotes with author spotlight.': 'Editoryal görüş veya maç sonu teknik direktör/oyuncu alıntısı.',
  'High-impact editorial cover image designed specifically for multi-post X threads.': 'Çok gönderili X serileri için hazırlanmış güçlü editoryal kapak.',
  'Full-time score graphic with goal scorers, minutes, key stats, and MVP spotlight.': 'Golcüler, dakikalar, temel veriler ve maçın oyuncusuyla maç sonucu grafiği.',
  'Data Sources': 'Veri Kaynakları',
  'This importer follows the active template. It updates only that template\'s data and preserves its visual settings.': 'Bu içe aktarıcı aktif şablona göre çalışır. Yalnızca o şablonun verilerini günceller ve görsel ayarları korur.',
  'Player Identity': 'Oyuncu Bilgileri',
  'Full Name': 'Ad Soyad',
  'Position(s)': 'Pozisyon(lar)',
  'Position': 'Pozisyon',
  'Club': 'Kulüp',
  'Nationality': 'Milliyet',
  'Flag': 'Bayrak',
  'Age': 'Yaş',
  'Preferred Foot': 'Tercih Ettiği Ayak',
  'Height': 'Boy',
  'Scouting Text': 'Scout Metni',
  'Executive Summary': 'Genel Değerlendirme',
  'Role & Tactical Profile': 'Rol ve Taktik Profil',
  'Performance Metrics': 'Performans Verileri',
  'Value': 'Değer',
  'Metric': 'Veri',
  'Key Strengths': 'Güçlü Yönler',
  'Development Areas': 'Gelişim Alanları',
  'Add': 'Ekle',
  'Player 1': 'Oyuncu 1',
  'Player 2': 'Oyuncu 2',
  'Comparison Context': 'Karşılaştırma Bağlamı',
  'Subtitle': 'Alt Başlık',
  'Verdict Title': 'Değerlendirme Başlığı',
  'Verdict': 'Değerlendirme',
  'Add Metric': 'Veri Ekle',
  'Transfer Identity': 'Transfer Bilgileri',
  'Player': 'Oyuncu',
  'From Club': 'Ayrıldığı Kulüp',
  'To Club': 'Yeni Kulüp',
  'Transfer Fee': 'Bonservis',
  'Contract': 'Sözleşme',
  'Headline': 'Ana Başlık',
  'Badge': 'Etiket',
  'Summary': 'Özet',
  'Transfer Conditions': 'Transfer Şartları',
  'Add Condition': 'Şart Ekle',
  'Subject Images': 'Konu Görselleri',
  'This template does not use a player cutout. Use the logo controls below instead.': 'Bu şablon varsayılan olarak oyuncu kesiti kullanmaz. Bunun yerine aşağıdaki logo kontrollerini kullanabilirsin.',
  'Template Logos': 'Şablon Logoları',
  'Player Club Logo': 'Oyuncu Kulüp Logosu',
  'Competition / Secondary Logo': 'Organizasyon / İkinci Logo',
  'Optional Extra Logo': 'Opsiyonel Ek Logo',
  'Competition Logo': 'Organizasyon Logosu',
  'Optional Competition Logo': 'Opsiyonel Organizasyon Logosu',
  'Team / Club Logo': 'Takım / Kulüp Logosu',
  'Opponent / Secondary Logo': 'Rakip / İkinci Logo',
  'Player / Club Logo': 'Oyuncu / Kulüp Logosu',
  'Highlighted Club Logo': 'Vurgulanan Kulüp Logosu',
  'Author Club Logo': 'Yazar Kulüp Logosu',
  'Source / Competition Logo': 'Kaynak / Organizasyon Logosu',
  'Topic / Club Logo': 'Konu / Kulüp Logosu',
  'Team Logo / Background Crest': 'Takım Logosu / Arka Plan Arması',
  'League Logo': 'Lig Logosu',
  'Size': 'Boyut',
  'Opacity': 'Opaklık',
  'Editorial Theme': 'Editoryal Tema',
  'Background Pattern': 'Arka Plan Deseni',
  'Template Layout Lock': 'Şablon Yerleşim Kilidi',
  'Unlock only when you need direct canvas movement.': 'Yalnızca canvas üzerinde doğrudan taşıma gerektiğinde kilidi aç.',
  'Locked': 'Kilitli',
  'Unlocked': 'Kilit Açık',
  'Display Font': 'Başlık Fontu',
  'Font family can be changed now. Template-specific headline sizing will be tuned in the dedicated layout phase.': 'Font ailesini buradan değiştirebilirsin. Şablona özel başlık boyutları yerleşim aşamasında ayrı ayrı ayarlanacak.',
  'Footer & Social Accounts': 'Footer ve Sosyal Medya',
  'Only enabled accounts appear in the card footer. The old Football Editorial Analytics text is no longer rendered.': 'Footer’da yalnızca açık olan hesaplar görünür. Eski Futbol Analizleri yazısı artık kullanılmıyor.',
  'Handle': 'Hesap',
  'Show': 'Göster',
  'Hide': 'Gizle',
  'Search Club Database': 'Kulüp Veritabanında Ara',
  'Manual Upload': 'Manuel Yükle',
  'OR': 'VEYA',
  'Selected': 'Seçildi',
  'Searching club database...': 'Kulüp veritabanında aranıyor...',
  'Search failed': 'Arama başarısız',
  'No clubs found with a logo.': 'Logosu bulunan kulüp bulunamadı.',
  'Checking extended Wikidata results…': 'Ek Wikidata sonuçları kontrol ediliyor…',
  'Upload': 'Yükle',
  'Remove': 'Kaldır',
  'Scale': 'Ölçek',
  'Flip': 'Yatay Çevir',
  'Bottom Fade': 'Alt Geçiş',
  'Upscaling…': 'Netleştiriliyor…',
  '2× Enhance': '2× Netleştir',
  'Generate Theme from Image': 'Görselden Tema Oluştur',
  'Optional unless the template specifically needs a subject image.': 'Şablon özellikle bir konu görseli gerektirmiyorsa opsiyoneldir.',
  'No image selected. The template remains clean without a fallback photo.': 'Görsel seçilmedi. Şablon herhangi bir varsayılan fotoğraf kullanmadan temiz kalır.',
  'Match Details': 'Maç Bilgileri',
  'Competition': 'Organizasyon',
  'Match Date': 'Maç Tarihi',
  'Kickoff Time & Venue': 'Başlama Saati ve Stadyum',
  'Team 1': 'Takım 1',
  'Team 2': 'Takım 2',
  'Name': 'Ad',
  'Manager': 'Teknik Direktör',
  'Standing': 'Sıralama',
  'Key Battle': 'Kilit Eşleşme',
  'Title': 'Başlık',
  'Details': 'Detaylar',
  'Tactical Keys': 'Taktik Anahtarlar',
  'Add Tactical Key': 'Taktik Anahtar Ekle',
  'Match Details & Scoreline': 'Maç Bilgileri ve Skor',
  'Score 1': 'Skor 1',
  'Score 2': 'Skor 2',
  'Match Stats': 'Maç İstatistikleri',
  'Add Stat': 'İstatistik Ekle',
  'Analysis & Performer': 'Analiz ve Öne Çıkan Oyuncu',
  'Tactical Summary': 'Taktik Özet',
  'Performer Title': 'Oyuncu Bölümü Başlığı',
  'Performer Name': 'Oyuncu Adı',
  'Performer Note': 'Oyuncu Notu',
  'Key Takeaways': 'Öne Çıkan Noktalar',
  'Core Principles': 'Ana Prensipler',
  'Tactical Note': 'Taktik Not',
  'Key Instructions': 'Temel Talimatlar',
  'Topic': 'Konu',
  'Team / Coach': 'Takım / Teknik Direktör',
  'Formation': 'Diziliş',
  'Phase': 'Faz',
  'Hero Stat': 'Ana İstatistik',
  'Hero Stat Label': 'Ana İstatistik Etiketi',
  'Rank Badge': 'Sıralama Etiketi',
  'Category Tag': 'Kategori Etiketi',
  'Sample Size': 'Örneklem',
  'Editorial Verdict': 'Editoryal Değerlendirme',
  'Category Title': 'Kategori Başlığı',
  'Metric Header': 'Veri Başlığı',
  'Season Filter': 'Sezon Filtresi',
  'Footer Note': 'Footer Notu',
  'Quote': 'Alıntı',
  'Author Name': 'İsim',
  'Author Role': 'Görev',
  'Topic Tag': 'Konu Etiketi',
  'Source Date': 'Kaynak / Tarih',
  'Key Punchline': 'Ana Vurgu',
  'Author Handle': 'Yazar Hesabı',
  'Topic Bullets': 'Konu Maddeleri',
  'Stage': 'Aşama',
  'MVP Player': 'Maçın Oyuncusu',
  'MVP Stat': 'Oyuncu İstatistiği',
  'Match Summary': 'Maç Özeti',
  'Team Name': 'Takım Adı',
  'League': 'Lig',
  'League Rank': 'Lig Sıralaması',
  'Tactical Style': 'Taktik Stil',
  'Strengths': 'Güçlü Yönler',
  'Weaknesses': 'Zayıf Yönler',
  'Open Design System Reference': 'Tasarım Sistemi Referansını Aç',
  'Run Pre-Flight Quality Audit': 'Görsel Kalite Kontrolünü Çalıştır',
  'BasitBiOyun Design System': 'BasitBiOyun Tasarım Sistemi',
  'Clean football editorial graphics. Template-specific data, purposeful imagery, strong hierarchy and no decorative filler.': 'Temiz futbol editoryal görselleri. Şablona özel veri, amaca uygun görsel kullanımı, güçlü hiyerarşi ve gereksiz dekorasyondan kaçınma.',
  'QA Audit': 'Kalite Kontrolü',
  'Copy': 'Kopyala',
  'Copied!': 'Kopyalandı!',
  'Export Format': 'Dışa Aktarma Formatı',
  'Resolution Multiplier': 'Çözünürlük Çarpanı',
  'Fit': 'Sığdır',
  'Edit Graphic': 'Görseli Düzenle',
  'Reset to Default': 'Varsayılana Sıfırla',
  'Undo': 'Geri Al',
  'Redo': 'Yinele',
  'Open Editor Controls': 'Düzenleme Panelini Aç',
  'Projects Library': 'Proje Arşivi',
  'Card output language': 'Görsel ve Studio dili',
  'Remove player image. Undo is available.': 'Oyuncu görselini kaldır. Geri alma kullanılabilir.',
  'Remove second player image. Undo is available.': 'İkinci oyuncu görselini kaldır. Geri alma kullanılabilir.',
  'Pre-Flight Quality Audit': 'Dışa Aktarma Öncesi Kalite Kontrolü',
  'Copy Image to Clipboard': 'Görseli Panoya Kopyala',
  'Change Resolution & Format': 'Çözünürlük ve Formatı Değiştir',
  'Zoom Out': 'Uzaklaştır',
  'Zoom In': 'Yakınlaştır',
  'Fit to Screen': 'Ekrana Sığdır',
  'Resize editor sidebar': 'Düzenleme Panelini Yeniden Boyutlandır',
};

const PHRASE_TR: Array<[RegExp, string]> = [
  [/^Import\s+(.+)\s+JSON$/i, '$1 JSON İçe Aktar'],
  [/^Import\s+(.+)$/i, '$1 İçe Aktar'],
  [/^Data Sources\s*·\s*(.+)$/i, 'Veri Kaynakları · $1'],
  [/^(.+) Visuals$/i, '$1 Görselleri'],
  [/^Player (\d+) Club Logo$/i, 'Oyuncu $1 Kulüp Logosu'],
  [/^Team (\d+) Logo$/i, 'Takım $1 Logosu'],
  [/^From Club Logo$/i, 'Ayrıldığı Kulüp Logosu'],
  [/^To Club Logo$/i, 'Yeni Kulüp Logosu'],
  [/^Competition Logo$/i, 'Organizasyon Logosu'],
  [/^Optional (.+)$/i, 'Opsiyonel $1'],
  [/^Add (.+)$/i, '$1 Ekle'],
  [/^Export (\d+)px$/i, '$1px Dışa Aktar'],
  [/^Export JSON$/i, 'JSON Dışa Aktar'],
  [/^Exported (.+) graphic successfully!$/i, '$1 görseli başarıyla dışa aktarıldı!'],
  [/^(.+) \(Selected\)$/i, '$1 (Seçildi)'],
  [/^Remove (.+)$/i, '$1 Kaldır'],
  [/^Open (.+)$/i, '$1 Aç'],
  [/^Close (.+)$/i, '$1 Kapat'],
];

export function translateStudioText(text: string, language: OutputLanguage): string {
  if (language !== 'tr' || !text) return text;
  const leading = text.match(/^\s*/)?.[0] || '';
  const trailing = text.match(/\s*$/)?.[0] || '';
  const core = text.trim();
  if (!core) return text;
  let translated = EXACT_TR[core] || core;
  for (const [pattern, replacement] of PHRASE_TR) translated = translated.replace(pattern, replacement);
  return `${leading}${translated}${trailing}`;
}

const originalText = new WeakMap<Text, string>();
const originalAttrs = new WeakMap<Element, Map<string, string>>();

function isCardNode(node: Node): boolean {
  const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement;
  return Boolean(element?.closest('#scouting-graphic-root'));
}

function localizeTextNode(node: Text, language: OutputLanguage) {
  if (isCardNode(node)) return;
  const current = node.nodeValue || '';
  let original = originalText.get(node);
  if (original === undefined) {
    original = current;
    originalText.set(node, original);
  } else {
    const previousTr = translateStudioText(original, 'tr');
    if (current !== original && current !== previousTr) {
      original = current;
      originalText.set(node, original);
    }
  }
  const desired = language === 'tr' ? translateStudioText(original, 'tr') : original;
  if (current !== desired) node.nodeValue = desired;
}

function localizeAttribute(element: Element, attr: string, language: OutputLanguage) {
  if (element.closest('#scouting-graphic-root')) return;
  const current = element.getAttribute(attr);
  if (current == null) return;
  let map = originalAttrs.get(element);
  if (!map) {
    map = new Map<string, string>();
    originalAttrs.set(element, map);
  }
  let original = map.get(attr);
  if (original === undefined) {
    original = current;
    map.set(attr, original);
  } else {
    const previousTr = translateStudioText(original, 'tr');
    if (current !== original && current !== previousTr) {
      original = current;
      map.set(attr, original);
    }
  }
  const desired = language === 'tr' ? translateStudioText(original, 'tr') : original;
  if (current !== desired) element.setAttribute(attr, desired);
}

export function localizeStudioElement(root: HTMLElement, language: OutputLanguage) {
  if (typeof document === 'undefined') return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    localizeTextNode(node as Text, language);
    node = walker.nextNode();
  }
  const elements = [root, ...Array.from(root.querySelectorAll('*'))];
  for (const element of elements) {
    for (const attr of ['title', 'aria-label', 'placeholder']) localizeAttribute(element, attr, language);
  }
  document.documentElement.lang = language === 'tr' ? 'tr-TR' : 'en';
}

export function attachStudioLocalization(root: HTMLElement, language: OutputLanguage): () => void {
  if (typeof MutationObserver === 'undefined') return () => {};
  let frame = 0;
  let running = false;
  const apply = () => {
    frame = 0;
    if (running) return;
    running = true;
    try {
      localizeStudioElement(root, language);
    } finally {
      running = false;
    }
  };
  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(apply);
  };
  apply();
  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['title', 'aria-label', 'placeholder'] });
  return () => {
    observer.disconnect();
    if (frame) window.cancelAnimationFrame(frame);
  };
}