import assert from 'node:assert/strict';
import {
  matchResultHeaderContext,
  matchResultMvpNameFontSize,
  matchResultScoreFontSize,
  visibleMatchResultScorers,
  visibleMatchResultStats,
} from '../src/services/matchResult';

assert.equal(
  matchResultHeaderContext(' Champions League ', ' Final '),
  'CHAMPIONS LEAGUE • FINAL',
  'Match Result should keep competition/stage context compact and normalized.',
);

assert.deepEqual(
  visibleMatchResultScorers([' Player A 12\' ', '', 'Player B 42\'', 'Player C 63\'', 'Player D 81\'', 'Player E 90+2\'']),
  ["Player A 12'", "Player B 42'", "Player C 63'", "Player D 81'"],
  'Match Result should keep at most four meaningful scorer entries per team.',
);

assert.equal(
  visibleMatchResultStats([
    { label: 'xG', val1: '1.9', val2: '0.8' },
    { label: '', val1: '12', val2: '7' },
    { label: 'Shots', val1: '12', val2: '7' },
    { label: 'Possession', val1: '54%', val2: '46%' },
    { label: 'Big Chances', val1: '4', val2: '1' },
    { label: 'Corners', val1: '8', val2: '3' },
  ]).length,
  4,
  'Match Result should render at most four meaningful key stats.',
);

assert.notEqual(
  matchResultScoreFontSize('FENERBAHÇE', 'LIVERPOOL', false),
  matchResultScoreFontSize('BORUSSIA MÖNCHENGLADBACH', 'PARIS SAINT-GERMAIN', false),
  'Long Match Result scorelines should scale down rather than overflow.',
);

assert.notEqual(
  matchResultMvpNameFontSize('CAN UZUN', false),
  matchResultMvpNameFontSize('A VERY LONG PLAYER OF THE MATCH NAME', false),
  'Long Player of the Match names should scale down rather than overflow.',
);

console.log('Match Result self-test passed.');
