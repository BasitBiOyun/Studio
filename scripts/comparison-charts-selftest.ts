import assert from 'node:assert/strict';
import { buildComparisonChartPoints, buildComparisonPercentilePoints, parseComparisonNumber } from '../src/services/comparisonCharts';

assert.equal(parseComparisonNumber('3.25'), 3.25);
assert.equal(parseComparisonNumber('61%'), 61);
assert.equal(parseComparisonNumber('n/a'), null);

const raw = buildComparisonChartPoints([
  { id: 'shots', label: 'Shots /90', val1: '3.2', val2: '2.4', higherIsBetter: true },
]);
assert.equal(raw.length, 1);
assert.equal(raw[0].score1, 100);
assert.equal(raw[0].score2, 75);

const lowerIsBetter = buildComparisonChartPoints([
  { id: 'turnovers', label: 'Turnovers /90', val1: '8', val2: '10', higherIsBetter: false },
], true);
assert.equal(lowerIsBetter[0].score1, 100);
assert.equal(lowerIsBetter[0].score2, 80);

const percentiles = buildComparisonPercentilePoints([
  { id: 'xa', label: 'xA /90', val1: '0.31', val2: '0.24', percentile1: 92, percentile2: '78' },
  { id: 'missing', label: 'Progressive passes', val1: '6', val2: '5' },
]);
assert.deepEqual(percentiles, [{ id: 'xa', label: 'xA /90', percentile1: 92, percentile2: 78 }]);

const clamped = buildComparisonPercentilePoints([
  { id: 'clamped', label: 'Metric', val1: '1', val2: '2', percentile1: 130, percentile2: -5 },
]);
assert.equal(clamped[0].percentile1, 100);
assert.equal(clamped[0].percentile2, 0);

console.log('comparison charts self-test passed');
