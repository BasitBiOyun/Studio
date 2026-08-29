import assert from 'node:assert/strict';
import {
  formatComparisonContext,
  getMetricWinner,
  visibleComparisonMetrics,
} from '../src/services/comparison';
import {
  formatTransferPlayerMeta,
  transferHeadlineFontSize,
  visibleTransferConditions,
} from '../src/services/transfer';
import {
  matchPreviewTitleFontSize,
  resolveMatchTiming,
  tacticalDecidersLabel,
  visibleMatchForm,
  visibleTacticalKeys,
} from '../src/services/matchPreview';
import {
  matchAnalysisHeaderLabel,
  matchAnalysisMetricShare,
  matchAnalysisScoreFontSize,
  visibleMatchAnalysisScorers,
  visibleMatchAnalysisStats,
  visibleMatchAnalysisTakeaways,
} from '../src/services/matchAnalysis';
import {
  tacticalDeepDiveLabel,
  tacticalTopicFontSize,
  visibleExecutionTriggers,
  visibleTacticalPrinciples,
} from '../src/services/tacticalAnalysis';
import {
  statHighlightHeroFontSize,
  statHighlightSubjectFontSize,
  statHighlightSubjectMeta,
  visibleStatHighlightMetrics,
} from '../src/services/statHighlight';
import {
  rankingMeta,
  rankingNameFontSize,
  rankingTitleFontSize,
  rankingValueFontSize,
  visibleRankingItems,
} from '../src/services/ranking';
import {
  quoteAuthorFontSize,
  quoteBodyFontSize,
  quoteHeaderContext,
  quotePunchlineFontSize,
} from '../src/services/quoteOpinion';

assert.equal(
  getMetricWinner({ id: 'higher', label: 'Shots', val1: '3.2', val2: '2.8', higherIsBetter: true }),
  'player1',
  'Higher-is-better metrics should highlight the larger value.',
);
assert.equal(
  getMetricWinner({ id: 'lower', label: 'Turnovers', val1: '8.1', val2: '6.4', higherIsBetter: false }),
  'player2',
  'Lower-is-better metrics should highlight the smaller value.',
);
assert.equal(
  getMetricWinner({ id: 'tie', label: 'xA', val1: '0.30', val2: '0.30' }),
  'tie',
  'Equal comparison values should not create a false winner.',
);
assert.equal(
  visibleComparisonMetrics(Array.from({ length: 8 }, (_, i) => ({ id: String(i), label: `M${i}`, val1: '1', val2: '2' }))).length,
  5,
  'Player Comparison should render at most five metrics.',
);
assert.equal(
  formatComparisonContext({ season: '2025/26', competition: 'Bundesliga', normalization: 'Per 90', minimumMinutes: 900 }),
  '2025/26 • BUNDESLIGA • PER 90 • MIN. 900 MINUTES',
);

assert.deepEqual(
  visibleTransferConditions([' Agreement reached ', '', 'Medical passed', 'Personal terms agreed', 'Extra note']),
  ['Agreement reached', 'Medical passed', 'Personal terms agreed'],
  'Transfer Graphic should keep only three meaningful deal conditions.',
);
assert.equal(
  formatTransferPlayerMeta({
    name: 'Test Player', age: '21', nationality: '', preferredFoot: '', height: '', positions: 'AM / SS', club: 'Club',
  }),
  'AM / SS • 21 Y/O',
  'Transfer header context should stay compact.',
);
assert.equal(
  formatTransferPlayerMeta({
    name: 'Test Player', age: '', nationality: '', preferredFoot: '', height: '', positions: '', club: 'Club',
  }),
  'TRANSFER UPDATE',
  'Transfer header should have a clean fallback when profile metadata is missing.',
);
assert.notEqual(
  transferHeadlineFontSize('HERE WE GO!', false),
  transferHeadlineFontSize('AGREEMENT REACHED BETWEEN CLUBS', false),
  'Long transfer headlines should scale down rather than overflow.',
);

assert.deepEqual(
  visibleMatchForm(['W', 'd', ' L ', 'W', 'D', 'L', 'W']),
  ['W', 'D', 'L', 'W', 'D'],
  'Match Preview should display at most the latest five supplied form results.',
);
assert.deepEqual(
  visibleTacticalKeys([' Press the first pass ', '', 'Attack the far post', 'Protect rest defence', 'Extra point']),
  ['Press the first pass', 'Attack the far post', 'Protect rest defence'],
  'Match Preview should keep only three meaningful tactical deciders.',
);
assert.equal(tacticalDecidersLabel(1), '1 KEY TACTICAL DECIDER');
assert.equal(tacticalDecidersLabel(3), '3 KEY TACTICAL DECIDERS');
assert.deepEqual(
  resolveMatchTiming('21:45 CET • RAMS PARK'),
  { kickoffTime: '21:45 CET', venue: 'RAMS PARK' },
  'Legacy combined kickoff/venue input should be separated for display.',
);
assert.deepEqual(
  resolveMatchTiming('21:45 CET', 'ŞÜKRÜ SARACOĞLU STADIUM'),
  { kickoffTime: '21:45 CET', venue: 'ŞÜKRÜ SARACOĞLU STADIUM' },
  'Explicit venue data should take precedence when supplied by JSON.',
);
assert.notEqual(
  matchPreviewTitleFontSize('FENERBAHÇE', 'LIVERPOOL', false),
  matchPreviewTitleFontSize('BORUSSIA MÖNCHENGLADBACH', 'PARIS SAINT-GERMAIN', false),
  'Long Match Preview team names should scale down rather than overflow.',
);

assert.equal(
  visibleMatchAnalysisStats([
    { label: 'xG', val1: '1', val2: '2' },
    { label: 'Shots', val1: '10', val2: '8' },
    { label: 'Possession', val1: '52', val2: '48' },
    { label: 'PPDA', val1: '8', val2: '12' },
    { label: 'Extra', val1: '1', val2: '1' },
  ]).length,
  4,
  'Match Analysis should render at most four key metrics.',
);
assert.deepEqual(
  visibleMatchAnalysisTakeaways([' First ', '', 'Second', 'Third', 'Fourth']),
  ['First', 'Second', 'Third'],
  'Match Analysis should keep only three meaningful takeaways.',
);
assert.deepEqual(
  visibleMatchAnalysisScorers([' Player A 12\' ', '', 'Player B 42\'', 'Player C 63\'', 'Player D 81\'', 'Player E 90+2\'']),
  ["Player A 12'", "Player B 42'", "Player C 63'", "Player D 81'"],
  'Match Analysis should limit scorer lines to avoid overflow.',
);
assert.equal(
  matchAnalysisMetricShare({ label: 'Shots', val1: '0', val2: '10' }),
  0,
  'A genuine zero value must remain zero rather than falling back to 50.',
);
assert.equal(
  matchAnalysisMetricShare({ label: 'No data', val1: 'N/A', val2: 'N/A' }),
  50,
  'Unparseable metric values should use a neutral split.',
);
assert.equal(
  matchAnalysisHeaderLabel('Champions League'),
  'CHAMPIONS LEAGUE • POST-MATCH ANALYSIS',
);
assert.notEqual(
  matchAnalysisScoreFontSize('FENERBAHÇE', 'LIVERPOOL', false),
  matchAnalysisScoreFontSize('BORUSSIA MÖNCHENGLADBACH', 'PARIS SAINT-GERMAIN', false),
  'Long Match Analysis scorelines should scale down rather than overflow.',
);

assert.deepEqual(
  visibleTacticalPrinciples([
    { title: ' Build-up ', description: ' Create a 3-2 base ' },
    { title: '', description: '' },
    { title: 'Width', description: 'Pin the full-back' },
    { title: 'Rest defence', description: 'Keep three behind the ball' },
    { title: 'Extra', description: 'Should not render' },
  ]),
  [
    { title: 'Build-up', description: 'Create a 3-2 base' },
    { title: 'Width', description: 'Pin the full-back' },
    { title: 'Rest defence', description: 'Keep three behind the ball' },
  ],
  'Tactical Analysis should keep only three meaningful core principles.',
);
assert.deepEqual(
  visibleExecutionTriggers([' Press on back pass ', '', 'Jump on poor first touch', 'Lock the touchline', 'Extra trigger']),
  ['Press on back pass', 'Jump on poor first touch', 'Lock the touchline'],
  'Tactical Analysis should keep only three meaningful execution triggers.',
);
assert.equal(
  tacticalDeepDiveLabel('In Possession'),
  'TACTICAL DEEP DIVE • IN POSSESSION',
);
assert.equal(
  tacticalDeepDiveLabel(''),
  'TACTICAL DEEP DIVE',
);
assert.notEqual(
  tacticalTopicFontSize('HIGH PRESS', false),
  tacticalTopicFontSize('HOW THE LEFT-SIDED OVERLOAD CREATES CENTRAL ACCESS', false),
  'Long Tactical Analysis topics should scale down rather than overflow.',
);

assert.equal(
  visibleStatHighlightMetrics([
    { id: '1', label: 'Passes /90', value: '45', icon: 'chart' },
    { id: '2', label: '', value: '8', icon: 'chart' },
    { id: '3', label: 'xA /90', value: '0.31', icon: 'chart' },
    { id: '4', label: 'Key Passes', value: '2.2', icon: 'chart' },
    { id: '5', label: 'Carries', value: '3.4', icon: 'chart' },
    { id: '6', label: 'Extra', value: '99', icon: 'chart' },
  ]).length,
  4,
  'Stat Highlight should keep at most four meaningful context metrics.',
);
assert.equal(
  statHighlightSubjectMeta('AM / SS', 'Eintracht Frankfurt'),
  'AM / SS • Eintracht Frankfurt',
);
assert.notEqual(
  statHighlightHeroFontSize('94.2%', false),
  statHighlightHeroFontSize('12345.678 /90', false),
  'Long hero stat values should scale down rather than overflow.',
);
assert.notEqual(
  statHighlightSubjectFontSize('CAN UZUN', false),
  statHighlightSubjectFontSize('A VERY LONG PLAYER OR TEAM SUBJECT NAME', false),
  'Long Stat Highlight subjects should scale down rather than overflow.',
);

assert.deepEqual(
  visibleRankingItems([
    { id: '3', rank: 3, playerName: ' Player C ', club: 'Club C', val: ' 7.2 ', subVal: 'U23' },
    { id: '1', rank: 1, playerName: 'Player A', club: 'Club A', val: '9.8' },
    { id: 'empty', rank: 2, playerName: '', club: 'Club B', val: '8.1' },
    { id: '2', rank: 2, playerName: 'Player B', club: 'Club B', val: '8.1' },
    { id: '4', rank: 4, playerName: 'Player D', club: 'Club D', val: '6.9' },
    { id: '5', rank: 5, playerName: 'Player E', club: 'Club E', val: '6.4' },
    { id: '6', rank: 6, playerName: 'Player F', club: 'Club F', val: '6.0' },
  ]).map((item) => item.id),
  ['1', '2', '3', '4', '5'],
  'Ranking Top List should sort supplied ranks, remove empty entries, and render at most five rows.',
);
assert.equal(
  rankingMeta('Eintracht Frankfurt', 'U21 • 900+ MIN'),
  'Eintracht Frankfurt • U21 • 900+ MIN',
);
assert.notEqual(
  rankingTitleFontSize('TOP 5 CREATORS', false),
  rankingTitleFontSize('TOP 5 UNDER-23 CHANCE CREATORS ACROSS EUROPE', false),
  'Long ranking titles should scale down rather than overflow.',
);
assert.notEqual(
  rankingNameFontSize('CAN UZUN', false),
  rankingNameFontSize('A VERY LONG PLAYER DISPLAY NAME', false),
  'Long ranking names should scale down rather than overflow.',
);
assert.notEqual(
  rankingValueFontSize('9.82', false),
  rankingValueFontSize('12345.678 /90', false),
  'Long ranking values should scale down rather than overflow.',
);

assert.deepEqual(
  quoteHeaderContext(' Matchday Reaction ', ' Press Conference • 29 Aug 2026 '),
  { topicTag: 'Matchday Reaction', sourceDate: 'Press Conference • 29 Aug 2026' },
  'Quote Opinion header context should trim optional labels without inventing content.',
);
assert.notEqual(
  quoteBodyFontSize('Short quote.', false),
  quoteBodyFontSize('A much longer quote that needs to remain readable across the card without forcing the layout to overflow. '.repeat(4), false),
  'Long Quote Opinion body text should scale down rather than overflow.',
);
assert.notEqual(
  quoteAuthorFontSize('JOSE MOURINHO', false),
  quoteAuthorFontSize('A VERY LONG AUTHOR OR SPEAKER DISPLAY NAME', false),
  'Long author names should scale down rather than overflow.',
);
assert.notEqual(
  quotePunchlineFontSize('Compact takeaway', false),
  quotePunchlineFontSize('A much longer takeaway that should remain secondary to the main quotation while still being readable on export.', false),
  'Long key takeaways should scale down rather than overflow.',
);

console.log('Template self-test passed: Player Comparison + Transfer Graphic + Match Preview + Match Analysis + Tactical Analysis + Stat Highlight + Ranking Top List + Quote Opinion content rules.');
