import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_PROJECT } from '../src/constants/presets';
import { runDesignQualityCheck } from '../src/services/qualityChecker';

const root = path.resolve(process.cwd());
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const app = read('src/App.tsx');
const canvas = read('src/components/InteractiveCanvas.tsx');
const card = read('src/components/ScoutingCard.tsx');
const playerPhoto = read('src/components/design/PlayerPhotoLayer.tsx');
const logosLayer = read('src/components/design/LogosLayer.tsx');
const projectLibrary = read('src/components/ProjectLibraryModal.tsx');
const storage = read('src/services/storage.ts');
const exporter = read('src/services/exporter.ts');
const sidebar = read('src/components/EditorSidebar.tsx');

assert.ok(
  !app.includes('currentProject.imageTransform'),
  'App must not write the removed root-level imageTransform field.',
);
assert.ok(
  app.includes('[data-editor-artboard]') && app.includes('data-editor-artboard'),
  'Workspace panning must ignore direct interactions inside the artboard.',
);
assert.ok(
  !app.includes('onUpdateTransform={handleCanvasTransform}'),
  'Legacy player-drag handling must not run alongside InteractiveCanvas.',
);
assert.ok(
  !canvas.includes('rotatable'),
  'Rotation controls must stay disabled until rotation is represented in ImageTransform.',
);
assert.ok(
  canvas.includes('0.35') && canvas.includes('3.5'),
  'Direct image scaling must be clamped to a safe range.',
);
assert.ok(
  canvas.includes("!activeTemplate.layout?.locked"),
  'Locked layouts must disable direct Moveable/Selecto editing.',
);
assert.ok(
  card.includes('interactive={directEditingEnabled}') && !card.includes('onUpdateTransform'),
  'Primary and secondary visuals should use the single direct-editing system.',
);
assert.ok(
  !playerPhoto.includes('assets.sorare.com/playerpicture'),
  'Broken user images must never silently fall back to a different real player.',
);
assert.ok(
  playerPhoto.includes("style.display = 'none'") && logosLayer.includes("style.display = 'none'"),
  'Broken player and logo visuals should fail safely without replacing the subject.',
);

assert.ok(
  projectLibrary.includes('await duplicateProjectInList') && projectLibrary.includes('await deleteProjectFromList'),
  'Project Library mutations must await IndexedDB operations.',
);
assert.ok(
  !projectLibrary.includes('p.theme.primaryAccent'),
  'Project Library must resolve theme data from the active template, not removed root fields.',
);
assert.ok(
  storage.includes('function deepMerge') && storage.includes('clone(DEFAULT_PROJECT)'),
  'Saved/legacy projects must be deeply migrated against current defaults.',
);
assert.ok(
  storage.includes('base.templates[type].theme = clone(customTheme)'),
  'Brand settings must actually be applied when a new project is created.',
);

for (const fidelityFlag of [
  'reconcile: true',
  'embedFonts: true',
  "cache: 'full'",
  'outerTransforms: true',
  'fast: false',
  'dpr: 1',
]) {
  assert.ok(exporter.includes(fidelityFlag), `SnapDOM export fidelity flag missing: ${fidelityFlag}`);
}

assert.ok(
  !sidebar.includes('<IconWand'),
  'Visuals tab must not contain the undefined IconWand component after prebuild repair.',
);
assert.ok(
  sidebar.includes('const [cropState, setCropState]'),
  'Visuals crop integration must have local React state.',
);
assert.ok(
  sidebar.includes("await import('browser-image-compression')") && sidebar.includes("await import('node-vibrant/browser')"),
  'Optional image tooling must stay lazy-loaded and browser-safe.',
);

const matchResultProject = JSON.parse(JSON.stringify(DEFAULT_PROJECT));
matchResultProject.templateType = 'match-result';
matchResultProject.sharedData.player.name = '';
const matchResultIssues = runDesignQualityCheck(matchResultProject);
assert.ok(
  !matchResultIssues.some((issue) => issue.id === 'missing-primary-content'),
  'Non-player templates must not be audited against sharedData.player.name.',
);

const comparisonProject = JSON.parse(JSON.stringify(DEFAULT_PROJECT));
comparisonProject.templateType = 'player-comparison';
comparisonProject.templates['player-comparison'].content.comparisonData.player2.name = '';
const comparisonIssues = runDesignQualityCheck(comparisonProject);
assert.ok(
  comparisonIssues.some((issue) => issue.id === 'comparison-player-missing'),
  'Player Comparison QA must detect a missing second player.',
);

const statProject = JSON.parse(JSON.stringify(DEFAULT_PROJECT));
statProject.templateType = 'stat-highlight';
statProject.templates['stat-highlight'].content.stats = [];
statProject.templates['stat-highlight'].content.statHighlightData.contextMetrics = [
  { id: 'broken', value: '', label: 'Metric', icon: 'chart' },
];
const statIssues = runDesignQualityCheck(statProject);
assert.ok(
  statIssues.some((issue) => issue.id === 'empty-stat-0'),
  'Stat Highlight QA must inspect contextMetrics rather than unrelated scouting stats.',
);

const expectedTemplateCases = [
  'player-comparison',
  'transfer-graphic',
  'match-preview',
  'match-analysis',
  'tactical-analysis',
  'stat-highlight',
  'ranking-top-list',
  'quote-opinion',
  'thread-cover',
  'match-result',
  'team-profile',
  'scouting-report',
];
for (const template of expectedTemplateCases) {
  assert.ok(card.includes(`case '${template}'`) || template === 'scouting-report', `Renderer missing template: ${template}`);
}

console.log('Core editor self-test passed: project storage, Visuals runtime, direct editing, QA and SnapDOM export safeguards.');
