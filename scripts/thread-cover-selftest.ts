import assert from 'node:assert/strict';
import {
  threadHeadlineFontSize,
  threadHeaderContext,
  threadSubtitleFontSize,
  threadTopicFontSize,
  visibleThreadTopics,
} from '../src/services/threadCover';

assert.deepEqual(
  visibleThreadTopics([
    ' Build-up structure ',
    '',
    'Pressing triggers',
    'Final-third rotations',
    'Extra section',
  ]),
  ['Build-up structure', 'Pressing triggers', 'Final-third rotations'],
  'Thread Cover should keep only three meaningful topic previews.',
);

assert.deepEqual(
  threadHeaderContext(' Tactical Deep Dive ', ' Analysis by @BasitBiOyun '),
  { badge: 'Tactical Deep Dive', authorHandle: 'Analysis by @BasitBiOyun' },
  'Thread Cover header context should trim optional labels without inventing content.',
);

assert.notEqual(
  threadHeadlineFontSize('PRESSING TRIGGERS', false),
  threadHeadlineFontSize('HOW THE LEFT-SIDED OVERLOAD CREATES CENTRAL ACCESS AND PROGRESSION', false),
  'Long Thread Cover headlines should scale down rather than overflow.',
);

assert.notEqual(
  threadSubtitleFontSize('A concise subtitle', false),
  threadSubtitleFontSize('A much longer explanatory subtitle that needs to remain secondary to the main headline and still fit comfortably in the cover layout. '.repeat(2), false),
  'Long Thread Cover subtitles should scale down rather than overflow.',
);

assert.notEqual(
  threadTopicFontSize('Build-up structure', false),
  threadTopicFontSize('How the first line manipulates the opposition press before finding central access', false),
  'Long Thread Cover topic labels should scale down rather than overflow.',
);

console.log('Thread Cover self-test passed.');
