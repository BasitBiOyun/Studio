import assert from 'node:assert/strict';
import {
  teamProfileHeaderContext,
  teamProfileStyleFontSize,
  teamProfileTitleFontSize,
  visibleTeamProfileMetrics,
  visibleTeamProfilePoints,
} from '../src/services/teamProfile';

assert.equal(
  teamProfileHeaderContext('Süper Lig', '2nd Place'),
  'SÜPER LIG • 2ND PLACE',
  'Team Profile should combine league and standing into one compact context line.',
);
assert.equal(
  teamProfileHeaderContext('', '2nd Place'),
  '2ND PLACE',
  'Team Profile should not leave dangling separators when league is missing.',
);
assert.equal(
  visibleTeamProfileMetrics([
    { id: '1', label: 'PPDA', value: '8.4', icon: 'chart' },
    { id: '2', label: '', value: '12', icon: 'chart' },
    { id: '3', label: 'Possession', value: '61%', icon: 'chart' },
    { id: '4', label: 'xG /90', value: '2.1', icon: 'chart' },
    { id: '5', label: 'High Regains', value: '9.2', icon: 'chart' },
    { id: '6', label: 'Extra', value: '99', icon: 'chart' },
  ]).length,
  4,
  'Team Profile should render at most four meaningful metrics.',
);
assert.deepEqual(
  visibleTeamProfilePoints([' Build-up structure ', '', 'Counterpress', 'Wide overloads', 'Extra']),
  ['Build-up structure', 'Counterpress', 'Wide overloads'],
  'Team Profile strengths and vulnerabilities should be limited to three meaningful points.',
);
assert.notEqual(
  teamProfileTitleFontSize('FENERBAHÇE', false),
  teamProfileTitleFontSize('BORUSSIA MÖNCHENGLADBACH FOOTBALL CLUB', false),
  'Long team names should scale down rather than overflow.',
);
assert.notEqual(
  teamProfileStyleFontSize('HIGH PRESS', false),
  teamProfileStyleFontSize('HIGH-INTENSITY POSITIONAL PLAY WITH AGGRESSIVE COUNTERPRESSING', false),
  'Long tactical style labels should scale down rather than overflow.',
);

console.log('Team Profile self-test passed: context, metric/point limits, and responsive typography rules.');
