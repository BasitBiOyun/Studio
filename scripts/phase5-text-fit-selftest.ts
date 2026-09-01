import fs from 'node:fs';
import { fitTextFontSizePx, estimateWrappedLineCount } from '../src/services/smartTextFit';
import { threadHeadlineFontSize, threadSubtitleFontSize } from '../src/services/threadCover';
import { rankingNameFontSize, rankingTitleFontSize, rankingValueFontSize } from '../src/services/ranking';
import { quoteAuthorFontSize, quoteBodyFontSize, quotePunchlineFontSize } from '../src/services/quoteOpinion';

function expect(condition: boolean, message: string) {
  if (!condition) throw new Error(`Phase 5 text-fit self-test failed: ${message}`);
}

const short = fitTextFontSizePx({
  text: 'Fenerbahçe',
  preferredPx: 64,
  minPx: 40,
  maxLines: 2,
  charsPerLineAtPreferred: 18,
});
expect(short === 64, 'normal-length content must keep its intended preferred size');

const long = fitTextFontSizePx({
  text: 'Fenerbahçe UEFA Şampiyonlar Ligi Çeyrek Final Öncesi Ayrıntılı Takım Analizi',
  preferredPx: 64,
  minPx: 40,
  maxLines: 2,
  charsPerLineAtPreferred: 18,
});
expect(long < short && long >= 40, 'long content must shrink only within its field-specific safe range');

const constrained = fitTextFontSizePx({
  text: 'Uzun başlık örneği iki satırda kontrollü biçimde kalmalı',
  preferredPx: 48,
  minPx: 28,
  maxLines: 3,
  charsPerLineAtPreferred: 24,
  containerHeightPx: 105,
  lineHeight: 1.1,
});
expect(constrained < 48 && constrained >= 28, 'container height must participate in text fitting');

expect(estimateWrappedLineCount('İstanbul\nŞükrü Saracoğlu', 40) === 2, 'explicit line breaks must be preserved');
expect(estimateWrappedLineCount('Çağlar Söyüncü İrfan Can Kahveci', 12) > 1, 'Turkish characters must be measured without corruption');

expect(Number.parseFloat(threadHeadlineFontSize('Kısa Başlık')) > Number.parseFloat(threadHeadlineFontSize('Çok uzun bir thread başlığı güvenli alan içinde kalmak için yalnızca kendi alanında küçülmelidir ve diğer metinleri etkilememelidir')), 'Thread Cover headline must fit independently');
expect(Number.parseFloat(threadSubtitleFontSize('Kısa alt başlık')) >= Number.parseFloat(threadSubtitleFontSize('Uzun alt başlık içerik yoğunluğuna göre kendi satır sınırı içinde kontrollü biçimde küçülmelidir ve başlık hiyerarşisini bozmamalıdır')), 'Thread Cover subtitle fit must be monotonic');
expect(Number.parseFloat(rankingTitleFontSize('Gol Krallığı')) > Number.parseFloat(rankingTitleFontSize('Avrupa Kupalarında Sezonun En Yüksek Gol Katkısı Sıralaması')), 'Ranking title must fit long content');
expect(Number.parseFloat(rankingNameFontSize('Can Uzun')) > Number.parseFloat(rankingNameFontSize('Abdülkerim Bardakcıoğlu Çok Uzun Oyuncu Adı')), 'Ranking player names must fit independently');
expect(Number.parseFloat(rankingValueFontSize('12')) >= Number.parseFloat(rankingValueFontSize('123456789012345')), 'Ranking stat values must respect single-line capacity');
expect(Number.parseFloat(quoteBodyFontSize('Kısa yorum')) > Number.parseFloat(quoteBodyFontSize('Bu uzun yorum metni, normal uzunluktaki metni gereksiz yere küçültmeden yalnızca kendi alanında satır sayısı ve konteyner yüksekliğine göre azaltılmalıdır. '.repeat(4))), 'Quote body must use container-aware fitting');
expect(Number.parseFloat(quoteAuthorFontSize('Ali Koç')) >= Number.parseFloat(quoteAuthorFontSize('Çok Uzun İsimli Futbol Yorumcusu')), 'Quote author must stay field-aware');
expect(Number.parseFloat(quotePunchlineFontSize('Kısa vurgu')) >= Number.parseFloat(quotePunchlineFontSize('Oldukça uzun bir vurgu cümlesi kendi satır kapasitesine göre küçülmelidir ve ana alıntı boyutuna dokunmamalıdır')), 'Quote punchline must fit independently');

for (const file of ['src/services/threadCover.ts', 'src/services/ranking.ts', 'src/services/quoteOpinion.ts']) {
  const source = fs.readFileSync(file, 'utf8');
  expect(source.includes("from './smartTextFit'"), `${file} must use the reusable smart text-fit core`);
}

console.log('Phase 5 text-fit self-test passed: reusable line/container-aware fitting preserves normal sizes and constrains long TR/EN content per field.');
