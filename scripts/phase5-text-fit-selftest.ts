import fs from 'node:fs';
import { fitTextFontSizePx, estimateWrappedLineCount } from '../src/services/smartTextFit';
import { threadHeadlineFontSize, threadSubtitleFontSize } from '../src/services/threadCover';
import { rankingNameFontSize, rankingTitleFontSize, rankingValueFontSize } from '../src/services/ranking';
import { quoteAuthorFontSize, quoteBodyFontSize, quotePunchlineFontSize } from '../src/services/quoteOpinion';
import { transferHeadlineFontSize, transferPlayerLineFontSize } from '../src/services/transfer';
import { matchPreviewTeamFontSize, matchPreviewTitleFontSize } from '../src/services/matchPreview';
import { matchAnalysisScoreFontSize } from '../src/services/matchAnalysis';
import { matchResultMvpNameFontSize, matchResultScoreFontSize } from '../src/services/matchResult';
import { teamProfileStyleFontSize, teamProfileTitleFontSize } from '../src/services/teamProfile';
import { statHighlightHeroFontSize, statHighlightSubjectFontSize } from '../src/services/statHighlight';
import { tacticalTopicFontSize } from '../src/services/tacticalAnalysis';

function expect(condition: boolean, message: string) {
  if (!condition) throw new Error(`Phase 5 text-fit self-test failed: ${message}`);
}

function px(value: string): number {
  return Number.parseFloat(value);
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

expect(px(threadHeadlineFontSize('Kısa Başlık')) > px(threadHeadlineFontSize('Çok uzun bir thread başlığı güvenli alan içinde kalmak için yalnızca kendi alanında küçülmelidir ve diğer metinleri etkilememelidir')), 'Thread Cover headline must fit independently');
expect(px(threadSubtitleFontSize('Kısa alt başlık')) >= px(threadSubtitleFontSize('Uzun alt başlık içerik yoğunluğuna göre kendi satır sınırı içinde kontrollü biçimde küçülmelidir ve başlık hiyerarşisini bozmamalıdır')), 'Thread Cover subtitle fit must be monotonic');
expect(px(rankingTitleFontSize('Gol Krallığı')) > px(rankingTitleFontSize('Avrupa Kupalarında Sezonun En Yüksek Gol Katkısı Sıralaması')), 'Ranking title must fit long content');
expect(px(rankingNameFontSize('Can Uzun')) > px(rankingNameFontSize('Abdülkerim Bardakcıoğlu Çok Uzun Oyuncu Adı')), 'Ranking player names must fit independently');
expect(px(rankingValueFontSize('12')) >= px(rankingValueFontSize('123456789012345')), 'Ranking stat values must respect single-line capacity');
expect(px(quoteBodyFontSize('Kısa yorum')) > px(quoteBodyFontSize('Bu uzun yorum metni, normal uzunluktaki metni gereksiz yere küçültmeden yalnızca kendi alanında satır sayısı ve konteyner yüksekliğine göre azaltılmalıdır. '.repeat(4))), 'Quote body must use container-aware fitting');
expect(px(quoteAuthorFontSize('Ali Koç')) >= px(quoteAuthorFontSize('Çok Uzun İsimli Futbol Yorumcusu')), 'Quote author must stay field-aware');
expect(px(quotePunchlineFontSize('Kısa vurgu')) >= px(quotePunchlineFontSize('Oldukça uzun bir vurgu cümlesi kendi satır kapasitesine göre küçülmelidir ve ana alıntı boyutuna dokunmamalıdır')), 'Quote punchline must fit independently');

expect(px(transferHeadlineFontSize('ANLAŞMA TAMAM', false)) > px(transferHeadlineFontSize('FENERBAHÇE TRANSFER OPERASYONUNDA SON AŞAMAYA GELDİ VE RESMİ AÇIKLAMA BEKLENİYOR', false)), 'Transfer headline must fit long Turkish copy');
expect(px(transferPlayerLineFontSize('Can Uzun', 'Fenerbahçe', false)) > px(transferPlayerLineFontSize('Abdülkerim Bardakcıoğlu Çok Uzun Oyuncu Adı', 'Borussia Mönchengladbach', false)), 'Transfer player/club line must fit independently');
expect(px(matchPreviewTitleFontSize('FENERBAHÇE', 'LIVERPOOL', false)) > px(matchPreviewTitleFontSize('BORUSSIA MÖNCHENGLADBACH', 'PARIS SAINT-GERMAIN', false)), 'Match Preview matchup title must fit long club names');
expect(px(matchPreviewTeamFontSize('FENERBAHÇE', false)) > px(matchPreviewTeamFontSize('BORUSSIA MÖNCHENGLADBACH', false)), 'Match Preview team labels must fit independently');
expect(px(matchAnalysisScoreFontSize('FENERBAHÇE', 'LIVERPOOL', false)) > px(matchAnalysisScoreFontSize('BORUSSIA MÖNCHENGLADBACH', 'PARIS SAINT-GERMAIN', false)), 'Match Analysis scoreline must fit long club names');
expect(px(matchResultScoreFontSize('FENERBAHÇE', 'LIVERPOOL', false)) > px(matchResultScoreFontSize('BORUSSIA MÖNCHENGLADBACH', 'PARIS SAINT-GERMAIN', false)), 'Match Result scoreline must fit long club names');
expect(px(matchResultMvpNameFontSize('Can Uzun', false)) > px(matchResultMvpNameFontSize('Abdülkerim Bardakcıoğlu Çok Uzun Oyuncu Adı', false)), 'Match Result MVP name must fit independently');
expect(px(teamProfileTitleFontSize('FENERBAHÇE', false)) > px(teamProfileTitleFontSize('BORUSSIA MÖNCHENGLADBACH FOOTBALL CLUB', false)), 'Team Profile title must fit long club names');
expect(px(teamProfileStyleFontSize('Önde yoğun baskı', false)) > px(teamProfileStyleFontSize('Top rakipteyken orta bloktan ön alan baskısına hızla geçen ve genişlik kullanımını sürekli değiştiren yapı', false)), 'Team Profile style text must fit its container');
expect(px(statHighlightHeroFontSize('12.4', false)) > px(statHighlightHeroFontSize('123456789012345', false)), 'Stat Highlight hero value must preserve single-line capacity');
expect(px(statHighlightSubjectFontSize('Can Uzun', false)) > px(statHighlightSubjectFontSize('Abdülkerim Bardakcıoğlu Çok Uzun Oyuncu Adı', false)), 'Stat Highlight subject must fit long names');
expect(px(tacticalTopicFontSize('ÖN ALAN BASKISI', false)) > px(tacticalTopicFontSize('SOL KORİDOR ÜZERİNDEN MERKEZ ERİŞİMİ VE ÜÇÜNCÜ ADAM KOŞULARIYLA İLERLEME', false)), 'Tactical Analysis topic must fit long Turkish headlines');

for (const file of [
  'src/services/threadCover.ts',
  'src/services/ranking.ts',
  'src/services/quoteOpinion.ts',
  'src/services/transfer.ts',
  'src/services/matchPreview.ts',
  'src/services/matchAnalysis.ts',
  'src/services/matchResult.ts',
  'src/services/teamProfile.ts',
  'src/services/statHighlight.ts',
  'src/services/tacticalAnalysis.ts',
]) {
  const source = fs.readFileSync(file, 'utf8');
  expect(source.includes("from './smartTextFit'"), `${file} must use the reusable smart text-fit core`);
}

const editorialHeader = fs.readFileSync('src/components/design/EditorialHeader.tsx', 'utf8');
expect(editorialHeader.includes("from '../../services/smartTextFit'"), 'shared Scouting/Comparison editorial header must use smart text fit');
expect(editorialHeader.includes('truncate'), 'shared editorial header must retain a final overflow guard');

console.log('Phase 5 text-fit self-test passed: reusable line/container-aware fitting covers shared headers and all text-heavy template families while preserving field isolation and Turkish text.');
