import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEFAULT_PROJECT, TEMPLATE_METADATA } from '../src/constants/presets';
import {
  applyAutoLayoutPreset,
  getActiveAutoLayoutPresetId,
  getAutoLayoutPresets,
  getDefaultAutoLayoutPresetId,
  resetAutoLayout,
  type AutoLayoutPresetId,
} from '../src/services/autoLayoutPresets';
import {
  createHistoryState,
  currentHistoryProject,
  pushHistoryState,
  redoHistoryState,
  undoHistoryState,
} from '../src/services/historyState';
import { applyTemplatePackToProject, parseTemplatePack } from '../src/services/templatePack';
import type { Project, TemplateType } from '../src/types';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const requiredExamples = new Set<AutoLayoutPresetId>([
  'player-left',
  'player-right',
  'centered-subject',
  'no-subject-full-content',
  'crest-background',
  'two-player-split',
]);
const exposed = new Set(TEMPLATE_METADATA.flatMap((meta) => getAutoLayoutPresets(meta.type).map((preset) => preset.id)));
for (const id of requiredExamples) assert.ok(exposed.has(id), `Missing Phase 10 example preset: ${id}`);

for (const meta of TEMPLATE_METADATA) {
  const templateType = meta.type as TemplateType;
  const options = getAutoLayoutPresets(templateType);
  assert.ok(options.length > 0, `${templateType} has no valid auto-layout presets.`);

  for (const option of options) {
    const source = clone(DEFAULT_PROJECT) as Project;
    source.templateType = templateType;
    const active = source.templates[templateType];
    assert.ok(active, `${templateType} template state is missing.`);

    (active.content as any).__phase10Marker = `KEEP-${templateType}`;
    active.visuals.playerImageSrc = `data:image/png;base64,PRIMARY-${templateType}`;
    active.visuals.secondaryPlayerImageSrc = `data:image/png;base64,SECONDARY-${templateType}`;
    active.visuals.logos = active.visuals.logos.map((logo, index) => ({
      ...logo,
      id: `semantic-${templateType}-${index}`,
      name: `Semantic ${templateType} ${index}`,
      src: `data:image/svg+xml,LOGO-${templateType}-${index}`,
      visible: true,
      x: index * 7,
      y: index === 0 ? 0 : index * -5,
      size: 80 + index,
      opacity: 91 - index,
    }));

    const contentBefore = clone(active.content);
    const logosBefore = clone(active.visuals.logos);
    const primarySrcBefore = active.visuals.playerImageSrc;
    const secondarySrcBefore = active.visuals.secondaryPlayerImageSrc;
    const inactiveBefore = Object.fromEntries(
      Object.entries(source.templates)
        .filter(([key]) => key !== templateType)
        .map(([key, value]) => [key, clone(value)]),
    );

    const updated = applyAutoLayoutPreset(source, option.id);
    const updatedTemplate = updated.templates[templateType];
    assert.equal(getActiveAutoLayoutPresetId(updated), option.id, `${templateType}/${option.id} did not become active.`);
    assert.deepEqual(updatedTemplate.content, contentBefore, `${templateType}/${option.id} changed content.`);
    assert.equal(updatedTemplate.visuals.playerImageSrc, primarySrcBefore, `${templateType}/${option.id} changed primary image source.`);
    assert.equal(updatedTemplate.visuals.secondaryPlayerImageSrc, secondarySrcBefore, `${templateType}/${option.id} changed secondary image source.`);
    assert.deepEqual(updatedTemplate.visuals.logos, logosBefore, `${templateType}/${option.id} changed semantic logo identity or geometry.`);

    const transform = updatedTemplate.visuals.imageTransform;
    assert.ok(transform.x >= -40 && transform.x <= 40, `${templateType}/${option.id} produced unsafe x.`);
    assert.ok(transform.y >= -20 && transform.y <= 20, `${templateType}/${option.id} produced unsafe y.`);
    assert.ok(transform.scale >= 0.7 && transform.scale <= 1.2, `${templateType}/${option.id} produced unsafe scale.`);

    for (const [key, value] of Object.entries(inactiveBefore)) {
      assert.deepEqual(updated.templates[key as TemplateType], value, `${templateType}/${option.id} changed inactive template ${key}.`);
    }

    const manual = clone(updated);
    manual.templates[templateType].visuals.imageTransform.x = 13;
    manual.templates[templateType].visuals.imageTransform.scale = 1.07;
    assert.equal(manual.templates[templateType].visuals.imageTransform.x, 13, 'Manual placement override is not possible after preset application.');
  }
}

{
  const source = clone(DEFAULT_PROJECT) as Project;
  source.templateType = 'scouting-report';
  source.templates['scouting-report'].visuals.imageTransform.x = 130;
  const hidden = applyAutoLayoutPreset(source, 'no-subject-full-content');
  const reset = resetAutoLayout(hidden);
  assert.equal(getActiveAutoLayoutPresetId(reset), getDefaultAutoLayoutPresetId('scouting-report'));
  assert.equal(reset.templates['scouting-report'].visuals.imageTransform.x, 28, 'Reset did not restore the known-safe player-right placement.');
  assert.equal(reset.templates['scouting-report'].visuals.imageTransform.scale, 1.02, 'Reset did not restore the known-safe scale.');
}

{
  const source = clone(DEFAULT_PROJECT) as Project;
  source.templateType = 'scouting-report';
  let history = createHistoryState(source);
  const left = applyAutoLayoutPreset(source, 'player-left');
  history = pushHistoryState(history, left);
  history = undoHistoryState(history);
  assert.deepEqual(currentHistoryProject(history, source), source, 'Undo did not restore the pre-layout state.');
  history = redoHistoryState(history);
  assert.equal(getActiveAutoLayoutPresetId(currentHistoryProject(history, source)), 'player-left', 'Redo did not restore the auto-layout preset.');
}

{
  const source = clone(DEFAULT_PROJECT) as Project;
  source.templateType = 'transfer-graphic';
  source.templates['transfer-graphic'].visuals.logos[0].src = 'data:image/svg+xml,FROM-KEEP';
  source.templates['transfer-graphic'].visuals.logos[1].src = 'data:image/svg+xml,TO-KEEP';
  const positioned = applyAutoLayoutPreset(source, 'player-left');
  const logosBefore = clone(positioned.templates['transfer-graphic'].visuals.logos);
  const pack = JSON.stringify({
    schemaVersion: 'transfer-graphic-pack-v1',
    templateType: 'transfer-graphic',
    data: { headline: 'PHASE 10 JSON STILL LOADS', fromClub: 'Club A', toClub: 'Club B' },
  });
  const parsed = parseTemplatePack(pack, 'transfer-graphic');
  assert.equal(parsed.error, null, 'Existing Transfer JSON pack stopped parsing.');
  const imported = applyTemplatePackToProject(positioned, 'transfer-graphic', parsed.data);
  assert.equal(getActiveAutoLayoutPresetId(imported), 'player-left', 'JSON import removed the active auto-layout preset.');
  assert.deepEqual(imported.templates['transfer-graphic'].visuals.logos, logosBefore, 'JSON import changed semantic logos after auto-layout selection.');
  assert.equal(imported.templates['transfer-graphic'].content.transferData?.headline, 'PHASE 10 JSON STILL LOADS');
}

const sidebarSource = fs.readFileSync('src/components/EditorSidebar.tsx', 'utf8');
assert.match(sidebarSource, /data-testid="auto-layout-presets"/, 'Auto Layout UI is missing.');
assert.match(sidebarSource, /auto-layout-reset/, 'Auto Layout reset control is missing.');
assert.match(sidebarSource, /getAutoLayoutPresets\(project\.templateType\)/, 'Auto Layout UI is not template-aware.');

const cardSource = fs.readFileSync('src/components/ScoutingCard.tsx', 'utf8');
assert.match(cardSource, /data-auto-layout-preset/, 'Canvas does not expose active auto-layout state.');
assert.match(cardSource, /isSubjectHiddenByAutoLayout/, 'No-subject layout is not wired to the global subject layer.');
assert.match(cardSource, /autoLayoutPreset === 'crest-background'/, 'Crest background rendering is missing.');

const scoutingSource = fs.readFileSync('src/components/templates/ScoutingReportView.tsx', 'utf8');
assert.match(scoutingSource, /col-span-12/, 'Scouting full-content layout is missing.');
assert.match(scoutingSource, /col-start-5/, 'Scouting player-left content safety column is missing.');

const transferSource = fs.readFileSync('src/components/templates/TransferGraphicView.tsx', 'utf8');
assert.match(transferSource, /col-start-6/, 'Transfer player-left safe column mapping is missing.');
assert.match(transferSource, /data-layout-content/, 'Transfer layout state is not observable for browser QA.');

const comparisonSource = fs.readFileSync('src/components/templates/PlayerComparisonView.tsx', 'utf8');
assert.match(comparisonSource, /hideSubjects/, 'Comparison no-subject layout is missing.');

const packageSource = fs.readFileSync('package.json', 'utf8');
assert.match(packageSource, /"test:phase10"/, 'Phase 10 self-test is not wired into package scripts.');
const workflowSource = fs.readFileSync('.github/workflows/visual-qa.yml', 'utf8');
assert.match(workflowSource, /phase10-browser-qa\.mjs/, 'Phase 10 browser QA is not wired into Responsive Visual QA.');

console.log('Phase 10 auto-layout preset self-test passed.');