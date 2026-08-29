import assert from 'node:assert/strict';
import { DEFAULT_PROJECT } from '../src/constants/presets';
import { parsePlayerPack, applyPlayerPackToProject } from '../src/services/playerPack';
import {
  registerPlayerDataProvider,
  unregisterPlayerDataProvider,
  searchPlayersAcrossProviders,
  fetchNormalizedPlayerPack,
  StaticPlayerDataProvider,
} from '../src/services/playerDataProviders';
import {
  createPlayerAutofillPreview,
  confirmPlayerAutofill,
} from '../src/services/playerAutofill';
import {
  formatComparisonContext,
  getMetricWinner,
  MAX_COMPARISON_METRICS,
  visibleComparisonMetrics,
} from '../src/services/comparison';

function freshProject() {
  return JSON.parse(JSON.stringify(DEFAULT_PROJECT));
}

const richPlayerPack = {
  schemaVersion: 'player-pack-v1',
  player: {
    name: 'Can Uzun',
    age: 20,
    nationality: { name: 'Turkey', code: 'TR' },
    heightCm: 186,
    preferredFoot: 'Right',
    positions: ['AM', 'SS', 'ST'],
    club: { name: 'Eintracht Frankfurt', country: 'Germany' },
  },
  context: { season: '2025/26', competition: 'Bundesliga' },
  stats: [
    { key: 'shots90', label: 'Shots /90', value: 3.13, percentile: 95, source: 'Test Source', status: 'verified' },
    { key: 'carries90', label: 'Progressive Carries /90', value: 3.35, status: 'derived', calculation: 'test' },
  ],
  scouting: {
    summary: 'Goal-scoring attacking midfielder.',
    tacticalProfile: 'Operates between midfield and the striker.',
    strengths: ['Finishing', 'Ball carrying'],
    development: ['Chance creation'],
  },
  sources: [{ provider: 'Test Source', verified: true, retrievedAt: '2026-08-29' }],
};

const parsedPlayer = parsePlayerPack(JSON.stringify(richPlayerPack));
assert.equal(parsedPlayer.error, null, `Player Pack should validate: ${parsedPlayer.error}`);
assert.ok(parsedPlayer.data, 'Player Pack parser should return data.');
const playerProject = applyPlayerPackToProject(freshProject(), parsedPlayer.data!);
assert.equal(playerProject.templateType, 'scouting-report');
assert.equal(playerProject.sharedData.player.name, 'Can Uzun');
assert.equal(playerProject.sharedData.player.height, '186 cm');
assert.equal(playerProject.sharedData.player.positions, 'AM / SS / ST');
assert.equal(playerProject.sharedData.player.countryFlag, 'tr');
assert.equal(playerProject.templates['scouting-report'].content.stats[0].provenance?.status, 'verified');
assert.equal(playerProject.templates['scouting-report'].content.stats[1].provenance?.status, 'calculated');

const studioPacks = [
  {
    schemaVersion: 'studio-pack-v1', templateType: 'player-scouting', projectTitle: 'Scouting Test',
    data: { player: { name: 'Test Player', nationality: 'Turkey', club: 'KAA Gent' }, summary: 'Summary', tacticalProfile: 'Profile', strengths: ['A'], development: ['B'], stats: [{ label: 'xA /90', value: 0.3, status: 'verified' }] },
  },
  {
    schemaVersion: 'studio-pack-v1', templateType: 'player-comparison',
    context: { season: '2025/26', competition: 'Bundesliga', minimumMinutes: 900, normalization: 'Per 90' },
    sources: [{ provider: 'Test Source', verified: true }],
    data: {
      playerA: { name: 'A', club: 'Club A', positions: 'AM', age: 20 },
      playerB: { name: 'B', club: 'Club B', positions: 'AM', age: 21 },
      metrics: [
        { label: 'xG /90', val1: 0.4, val2: 0.3, higherIsBetter: true },
        { label: 'Turnovers /90', val1: 2.1, val2: 3.4, higherIsBetter: false },
      ],
      verdict: 'A offers more shot threat while also protecting possession better.',
    },
  },
  {
    schemaVersion: 'studio-pack-v1', templateType: 'transfer-graphic',
    data: { player: { name: 'Transfer Player' }, headline: 'DONE DEAL', badgeText: 'OFFICIAL', transferFee: '€10M', contractLength: '4 years', fromClub: 'Club A', toClub: 'Club B', detailsSummary: 'Agreement reached.', keyConditions: ['Condition'] },
  },
  {
    schemaVersion: 'studio-pack-v1', templateType: 'match-preview',
    data: { competition: 'League', matchDate: '2026-08-29', kickoffTime: '21:00', team1: { name: 'A' }, team2: { name: 'B' }, keyBattleTitle: 'Battle', keyBattleDetails: 'Details', tacticalKeys: ['Key'] },
  },
  {
    schemaVersion: 'studio-pack-v1', templateType: 'match-analysis',
    data: { competition: 'League', scoreline: { team1: 'A', score1: 2, team2: 'B', score2: 1 }, stats: [{ label: 'xG', val1: 1.5, val2: 0.8 }], tacticalSummary: 'Summary', keyTakeaways: ['One'] },
  },
  {
    schemaVersion: 'studio-pack-v1', templateType: 'tactical-analysis',
    data: { topic: 'Press', teamOrCoach: 'A', formation: '4-3-3', phase: 'Out of Possession', corePrinciples: [{ title: 'Press', description: 'High press' }], tacticalNote: 'Note', keyInstructions: ['Trigger'], players: [{ id: 'p1', name: 'Player', x: 50, y: 50 }], averagePositions: [{ playerId: 'p1', x: 50, y: 50 }], passingNetwork: [] },
  },
  {
    schemaVersion: 'studio-pack-v1', templateType: 'stat-highlight',
    data: { heroStat: '95%', heroStatLabel: 'Accuracy', contextMetrics: [{ label: 'Passes /90', value: 50 }], editorialVerdict: 'Elite.' },
  },
  {
    schemaVersion: 'studio-pack-v1', templateType: 'ranking-list',
    data: { categoryTitle: 'Top 5', items: [{ rank: 1, playerName: 'A', val: 1.2 }] },
  },
  {
    schemaVersion: 'studio-pack-v1', templateType: 'quote-opinion',
    data: { quote: 'Quote', authorName: 'Coach', keyPunchline: 'Punchline' },
  },
  {
    schemaVersion: 'studio-pack-v1', templateType: 'thread-cover',
    data: { headline: 'Thread', subtitle: 'Subtitle', topicBullets: ['One'] },
  },
  {
    schemaVersion: 'studio-pack-v1', templateType: 'match-result',
    data: { team1: 'A', team2: 'B', score1: 2, score2: 0, matchStats: [{ label: 'Shots', val1: 10, val2: 5 }], matchSummary: 'Summary' },
  },
  {
    schemaVersion: 'studio-pack-v1', templateType: 'team-profile',
    data: { teamName: 'Team', manager: 'Coach', metrics: [{ label: 'xG /90', value: 2.1 }], strengths: ['Press'], weaknesses: ['Space'], tacticalSummary: 'Summary' },
  },
] as const;

const expectedTypes = [
  'scouting-report', 'player-comparison', 'transfer-graphic', 'match-preview',
  'match-analysis', 'tactical-analysis', 'stat-highlight', 'ranking-top-list',
  'quote-opinion', 'thread-cover', 'match-result', 'team-profile',
];

for (let index = 0; index < studioPacks.length; index += 1) {
  const initial = freshProject();
  const initialTheme = JSON.stringify(initial.templates[expectedTypes[index]].theme);
  const initialImage = initial.templates[expectedTypes[index]].visuals.playerImageSrc;
  const result = parsePlayerPack(JSON.stringify(studioPacks[index]));
  assert.equal(result.error, null, `Studio Pack ${studioPacks[index].templateType} should validate: ${result.error}`);
  assert.ok(result.data, `${studioPacks[index].templateType} should produce data.`);
  const applied = applyPlayerPackToProject(initial, result.data!);
  assert.equal(applied.templateType, expectedTypes[index], `${studioPacks[index].templateType} should select the correct template.`);
  assert.equal(JSON.stringify(applied.templates[expectedTypes[index]].theme), initialTheme, 'Studio Pack must preserve the theme.');
  assert.equal(applied.templates[expectedTypes[index]].visuals.playerImageSrc, initialImage, 'Studio Pack must preserve player visuals.');
}

const comparisonResult = parsePlayerPack(JSON.stringify(studioPacks[1]));
assert.ok(comparisonResult.data, 'Comparison Studio Pack should parse.');
const comparisonProject = applyPlayerPackToProject(freshProject(), comparisonResult.data!);
const comparisonData = comparisonProject.templates['player-comparison'].content.comparisonData!;
assert.equal(comparisonData.player1.name, 'A', 'Player A must come from comparisonData, not shared scouting state.');
assert.equal(comparisonData.player2.name, 'B');
assert.equal(getMetricWinner(comparisonData.metrics[0]), 'player1', 'Higher-is-better metrics should prefer the larger value.');
assert.equal(getMetricWinner(comparisonData.metrics[1]), 'player1', 'Lower-is-better metrics should prefer the smaller value.');
assert.equal(
  formatComparisonContext((comparisonProject.templates['player-comparison'].content as any).dataProvenance?.context),
  '2025/26 • BUNDESLIGA • PER 90 • MIN. 900 MINUTES',
  'Comparison context should produce a compact standardized line.',
);
assert.equal(
  visibleComparisonMetrics([...comparisonData.metrics, ...comparisonData.metrics, ...comparisonData.metrics]).length,
  MAX_COMPARISON_METRICS,
  'Comparison view should never render more than five metrics.',
);

const providerPack = richPlayerPack as any;
const provider = new StaticPlayerDataProvider('selftest', 'Self Test Provider', { 'can-uzun': providerPack });
registerPlayerDataProvider(provider);
const searchResults = await searchPlayersAcrossProviders('Can');
assert.equal(searchResults.length, 1, 'Provider search should return the curated player.');
assert.equal(searchResults[0].providerId, 'selftest');
const normalizedProviderPack = await fetchNormalizedPlayerPack('selftest', 'can-uzun');
assert.equal(normalizedProviderPack.player.name, 'Can Uzun');

const preview = await createPlayerAutofillPreview('selftest', 'can-uzun', searchResults[0]);
assert.equal(preview.changes.playerName, 'Can Uzun');
assert.equal(preview.changes.statsCount, 2);
const beforeConfirm = freshProject();
assert.notEqual(beforeConfirm.sharedData.player.name, 'Can Uzun', 'Preview must not mutate project state.');
const confirmed = confirmPlayerAutofill(beforeConfirm, preview);
assert.equal(confirmed.sharedData.player.name, 'Can Uzun', 'Confirmation should apply the normalized pack.');
unregisterPlayerDataProvider('selftest');

console.log(`Data layer self-test passed: Player Pack + ${studioPacks.length} Studio Pack templates + perfected comparison rules + provider search/fetch/normalize + preview/confirm.`);
