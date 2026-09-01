import assert from 'node:assert/strict';
import { DEFAULT_PROJECT } from '../src/constants/presets';
import { generateBatchContentSet } from '../src/services/batchContentGenerator';
import { Project } from '../src/types';

function fresh(): Project {
  return JSON.parse(JSON.stringify(DEFAULT_PROJECT)) as Project;
}

const source = fresh();
source.id = 'phase12-source';
source.name = 'Ethan Nwaneri Scouting';
source.templateType = 'scouting-report';
source.aspectRatio = '4:5';
source.sharedData.player.name = 'Ethan Nwaneri';
source.templates['scouting-report'].content.profile.summary = 'Source-backed scouting summary.';
source.templates['scouting-report'].content.strengths = ['Carries forward', 'Left-foot threat'];
source.templates['scouting-report'].content.stats = [{
  id: 'progressive-carries',
  value: '4.8',
  label: 'Progressive carries /90',
  icon: 'run',
  percentileRank: 'Top 12%',
  provenance: { status: 'verified', competition: 'Premier League', season: '2025/26', sampleSize: '900+ mins' },
}];
source.templates['scouting-report'].theme.name = 'Phase12 Brand';
source.templates['scouting-report'].visuals.playerImageSrc = 'data:image/png;base64,PLAYER';
source.templates['scouting-report'].visuals.logos = [
  { id: 'club', name: 'Arsenal', src: 'data:image/svg+xml,ARSENAL', visible: true, x: 1, y: 2, size: 100, opacity: 100 },
];

const outputs = generateBatchContentSet(source);
assert.deepEqual(outputs.map((output) => output.kind), ['main', 'story', 'stat-highlight', 'thread-cover']);
assert.equal(outputs[0].project.aspectRatio, '4:5', 'Main output must preserve source ratio.');
assert.equal(outputs[1].project.aspectRatio, '9:16', 'Story output must use vertical ratio.');
assert.equal(outputs[2].project.templateType, 'stat-highlight');
assert.equal(outputs[3].project.templateType, 'thread-cover');

for (const output of outputs) {
  assert.notEqual(output.project.id, source.id, `${output.kind} must be independently editable.`);
  assert.equal(output.project.templates[output.project.templateType].theme.name, 'Phase12 Brand', `${output.kind} lost the active brand preset.`);
  assert.equal(output.project.templates[output.project.templateType].visuals.playerImageSrc, 'data:image/png;base64,PLAYER', `${output.kind} lost selected player asset.`);
  assert.equal(output.project.templates[output.project.templateType].visuals.logos[0].id, 'club', `${output.kind} lost semantic logo identity.`);
  assert.equal(output.project.templates[output.project.templateType].visuals.logos[0].src, 'data:image/svg+xml,ARSENAL', `${output.kind} swapped/dropped source logo.`);
}

const stat = outputs.find((output) => output.kind === 'stat-highlight')!.project.templates['stat-highlight'].content.statHighlightData!;
assert.equal(stat.heroStat, '4.8');
assert.equal(stat.heroStatLabel, 'Progressive carries /90');
assert.equal(stat.rankBadge, 'Top 12%');
assert.equal(stat.sampleSize, 'Premier League • 2025/26 • 900+ mins');
assert.equal(stat.editorialVerdict, 'Source-backed scouting summary.');

const thread = outputs.find((output) => output.kind === 'thread-cover')!.project.templates['thread-cover'].content.threadCoverData!;
assert.equal(thread.headline, 'Ethan Nwaneri');
assert.equal(thread.subtitle, 'Source-backed scouting summary.');
assert.deepEqual(thread.topicBullets, ['Carries forward', 'Left-foot threat']);

outputs[0].project.sharedData.player.name = 'Changed independently';
assert.equal(source.sharedData.player.name, 'Ethan Nwaneri', 'Generated project mutation leaked into source project.');
assert.equal(outputs[1].project.sharedData.player.name, 'Ethan Nwaneri', 'Generated projects share mutable state.');

const noFacts = fresh();
noFacts.templateType = 'scouting-report';
noFacts.templates['scouting-report'].content.stats = [];
noFacts.templates['scouting-report'].content.strengths = [];
noFacts.templates['scouting-report'].content.profile.summary = '';
noFacts.sharedData.player.name = '';
noFacts.name = '';
const minimal = generateBatchContentSet(noFacts);
assert.equal(minimal.some((output) => output.kind === 'stat-highlight'), false, 'Generator invented a stat without source data.');
assert.equal(minimal.some((output) => output.kind === 'thread-cover'), false, 'Generator invented thread content without source data.');
assert.deepEqual(minimal.map((output) => output.kind), ['main', 'story']);

const filenames = outputs.map((output) => output.project.name.replace(/[^a-zA-Z0-9_-]/g, '_'));
assert.equal(new Set(filenames).size, filenames.length, 'Generated output names are not deterministic/unique enough for clean exports.');

console.log('Phase 12 batch content generator self-test passed.');
