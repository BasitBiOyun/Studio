import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_PROJECT } from '../src/constants/presets';
import { translateCardText } from '../src/services/outputLanguage';
import { applyTemplatePackToProject, parseTemplatePack } from '../src/services/templatePack';

assert.equal(translateCardText('Key Strengths', 'tr'), 'Güçlü Yönler');
assert.equal(translateCardText('Manager: José Mourinho', 'tr'), 'Teknik Direktör: José Mourinho');
assert.equal(translateCardText('Key Strengths', 'en'), 'Key Strengths');

const previewPack = JSON.stringify({
  schemaVersion: 'match-preview-pack-v1',
  templateType: 'match-preview',
  competition: 'UEFA Champions League',
  team1: { name: 'Fenerbahçe' },
  team2: { name: 'Liverpool' },
  tacticalKeys: ['Second-ball control'],
});

const parsedPreview = parseTemplatePack(previewPack, 'match-preview');
assert.equal(parsedPreview.error, null);
assert.ok(parsedPreview.data);

const original = JSON.parse(JSON.stringify(DEFAULT_PROJECT));
original.templateType = 'match-preview';
original.templates['match-preview'].visuals.playerImageSrc = 'data:image/png;base64,KEEP';
const updated = applyTemplatePackToProject(original, 'match-preview', parsedPreview.data);

assert.equal(updated.templates['match-preview'].content.matchPreviewData?.team1.name, 'Fenerbahçe');
assert.equal(updated.templates['match-preview'].content.matchPreviewData?.team2.name, 'Liverpool');
assert.equal(updated.templates['match-preview'].visuals.playerImageSrc, 'data:image/png;base64,KEEP');
assert.equal((updated.templates['match-preview'].content.matchPreviewData as any)?.schemaVersion, undefined);
assert.equal((updated.templates['match-preview'].content.matchPreviewData as any)?.templateType, undefined);

const wrongTemplate = parseTemplatePack(previewPack, 'match-result');
assert.ok(wrongTemplate.error?.includes('active template is match-result'));

const root = path.resolve(process.cwd());
const canvas = fs.readFileSync(path.join(root, 'src/components/InteractiveCanvas.tsx'), 'utf8');
const topBar = fs.readFileSync(path.join(root, 'src/components/TopBar.tsx'), 'utf8');
const card = fs.readFileSync(path.join(root, 'src/components/ScoutingCard.tsx'), 'utf8');

assert.ok(canvas.includes('Import {templatePackLabel(activeTemplateKey)} JSON'));
assert.ok(canvas.includes('Remove Player Image'));
assert.ok(canvas.includes('secondaryPlayerImageSrc ='));
assert.ok(topBar.includes("(['tr', 'en'] as const)"));
assert.ok(card.includes('localizeCardElement'));
assert.ok(card.includes('card-language-${outputLanguage}'));

console.log('Template pack + bilingual card self-test passed.');
