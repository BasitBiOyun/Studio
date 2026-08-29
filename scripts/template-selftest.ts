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

console.log('Template self-test passed: Player Comparison + Transfer Graphic content rules.');
