import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEFAULT_PROJECT } from '../src/constants/presets';
import type { Project, TemplateType } from '../src/types';
import {
  TEMPLATE_VARIANTS,
  applyTemplateVariant,
  getActiveTemplateVariantId,
  getTemplateVariants,
  type TemplateVariantId,
} from '../src/services/templateVariants';
import {
  createHistoryState,
  currentHistoryProject,
  pushHistoryState,
  redoHistoryState,
  undoHistoryState,
} from '../src/services/historyState';
import { applyTemplatePackToProject, parseTemplatePack } from '../src/services/templatePack';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const supported: TemplateType[] = ['transfer-graphic', 'match-preview', 'scouting-report', 'player-comparison'];

assert.deepEqual(
  getTemplateVariants('transfer-graphic').map((item) => item.label),
  ['Minimal', 'Breaking', 'Editorial'],
  'Transfer Graphic variants are incomplete.',
);
assert.deepEqual(
  getTemplateVariants('match-preview').map((item) => item.label),
  ['Editorial', 'Poster', 'Data'],
  'Match Preview variants are incomplete.',
);
assert.deepEqual(
  getTemplateVariants('scouting-report').map((item) => item.label),
  ['Editorial', 'Data'],
  'Scouting Report variants are incomplete.',
);
assert.deepEqual(
  getTemplateVariants('player-comparison').map((item) => item.label),
  ['Split', 'Table / Data'],
  'Player Comparison variants are incomplete.',
);

for (const templateType of supported) {
  const before = clone(DEFAULT_PROJECT) as Project;
  before.templateType = templateType;
  const activeBefore = before.templates[templateType];
  (activeBefore.content as any).phase9Marker = `KEEP-CONTENT-${templateType}`;
  activeBefore.visuals.playerImageSrc = `data:image/png;base64,PRIMARY-${templateType}`;
  activeBefore.visuals.secondaryPlayerImageSrc = `data:image/png;base64,SECONDARY-${templateType}`;
  activeBefore.visuals.logos = activeBefore.visuals.logos.map((logo, index) => ({
    ...logo,
    id: `semantic-${templateType}-${index}`,
    name: `Semantic ${index}`,
    src: `data:image/svg+xml,LOGO-${templateType}-${index}`,
    visible: true,
  }));

  const contentSnapshot = clone(activeBefore.content);
  const visualsSnapshot = clone(activeBefore.visuals);
  const inactiveSnapshot = Object.fromEntries(
    Object.entries(before.templates)
      .filter(([key]) => key !== templateType)
      .map(([key, value]) => [key, clone(value)]),
  );

  const options = getTemplateVariants(templateType);
  assert.ok(options.length >= 2, `${templateType} should expose controlled variants.`);

  for (const option of options) {
    const updated = applyTemplateVariant(before, option.id);
    assert.equal(getActiveTemplateVariantId(updated), option.id, `${templateType} did not activate ${option.id}.`);
    assert.deepEqual(updated.templates[templateType].content, contentSnapshot, `${option.id} changed template content.`);
    assert.deepEqual(updated.templates[templateType].visuals, visualsSnapshot, `${option.id} changed visual assets or semantic logos.`);
    assert.deepEqual(
      Object.fromEntries(Object.entries(updated.templates).filter(([key]) => key !== templateType)),
      inactiveSnapshot,
      `${option.id} changed an inactive template.`,
    );
    assert.equal((updated.templates[templateType].layout as any).templateVariant, option.id, `${option.id} was not stored only in layout state.`);
  }

  const first = options[0].id;
  const second = options[1].id;
  const firstState = applyTemplateVariant(before, first);
  const secondState = applyTemplateVariant(firstState, second);
  const backToFirst = applyTemplateVariant(secondState, first);
  assert.equal(getActiveTemplateVariantId(backToFirst), first, `${templateType} variant switching is not reversible.`);
  assert.deepEqual(backToFirst.templates[templateType].content, contentSnapshot, `${templateType} lost data after switching back.`);
  assert.deepEqual(backToFirst.templates[templateType].visuals, visualsSnapshot, `${templateType} swapped visual assets after switching back.`);

  let history = createHistoryState(before);
  history = pushHistoryState(history, secondState);
  history = undoHistoryState(history);
  assert.deepEqual(currentHistoryProject(history, before), before, `${templateType} undo did not restore the previous project.`);
  history = redoHistoryState(history);
  assert.equal(getActiveTemplateVariantId(currentHistoryProject(history, before)), second, `${templateType} redo did not restore the variant.`);

  const invalid = applyTemplateVariant(before, 'match-poster' as TemplateVariantId);
  if (templateType !== 'match-preview') {
    assert.equal(invalid, before, `${templateType} accepted a variant from another template.`);
  }
}

const transferProject = clone(DEFAULT_PROJECT) as Project;
transferProject.templateType = 'transfer-graphic';
transferProject.templates['transfer-graphic'].visuals.logos[0].src = 'data:image/svg+xml,FROM';
transferProject.templates['transfer-graphic'].visuals.logos[1].src = 'data:image/svg+xml,TO';
const withVariant = applyTemplateVariant(transferProject, 'transfer-breaking');
const parsed = parseTemplatePack(JSON.stringify({
  schemaVersion: 'transfer-graphic-pack-v1',
  templateType: 'transfer-graphic',
  headline: 'PHASE 9 JSON STILL LOADS',
  fromClub: 'FROM CLUB',
  toClub: 'TO CLUB',
}), 'transfer-graphic');
assert.equal(parsed.error, null, 'Existing Transfer Graphic JSON pack no longer parses.');
const imported = applyTemplatePackToProject(withVariant, 'transfer-graphic', parsed.data);
assert.equal((imported.templates['transfer-graphic'].layout as any).templateVariant, 'transfer-breaking', 'JSON import erased the selected variant.');
assert.equal(imported.templates['transfer-graphic'].visuals.logos[0].src, 'data:image/svg+xml,FROM', 'JSON import changed from-club semantic logo.');
assert.equal(imported.templates['transfer-graphic'].visuals.logos[1].src, 'data:image/svg+xml,TO', 'JSON import changed to-club semantic logo.');
assert.equal(imported.templates['transfer-graphic'].content.transferData?.headline, 'PHASE 9 JSON STILL LOADS', 'JSON import did not update content inside a variant.');

const sidebar = fs.readFileSync('src/components/EditorSidebar.tsx', 'utf8');
assert.match(sidebar, /template-variants-toggle/, 'Template variant selector UI is missing.');
assert.match(sidebar, /onChange\(applyTemplateVariant\(project, variantId\)\)/, 'Variant selector bypasses the normal project history path.');

for (const file of [
  'src/components/templates/TransferGraphicView.tsx',
  'src/components/templates/MatchPreviewView.tsx',
  'src/components/templates/ScoutingReportView.tsx',
  'src/components/templates/PlayerComparisonView.tsx',
]) {
  const source = fs.readFileSync(file, 'utf8');
  assert.match(source, /getActiveTemplateVariantId/, `${file} is not variant-aware.`);
  assert.match(source, /data-template-variant=/, `${file} does not expose its active composition for QA.`);
}

assert.ok(TEMPLATE_VARIANTS['transfer-graphic']?.every((item) => item.visualMode), 'Variants must expose controlled visual modes.');
console.log('Phase 9 template variants self-test passed.');
