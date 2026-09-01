import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEFAULT_PROJECT, TEMPLATE_METADATA } from '../src/constants/presets';
import type { Project, TemplateType } from '../src/types';
import {
  applyTemplatePackToProject,
  createTemplatePack,
  getTemplatePackDefinition,
  parseTemplatePack,
} from '../src/services/templatePack';
import { getTemplatePackSchemaVersion, getTemplatePackVisualSlots } from '../src/services/templatePackSchema';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const fresh = (templateType: TemplateType): Project => {
  const project = clone(DEFAULT_PROJECT) as Project;
  project.templateType = templateType;
  return project;
};

const templateTypes = TEMPLATE_METADATA.map((item) => item.type as TemplateType);
assert.equal(templateTypes.length, 12, 'Phase 11 expects all 12 Studio templates.');

const versions = new Set<string>();
for (const templateType of templateTypes) {
  const definition = getTemplatePackDefinition(templateType);
  assert.ok(definition, `${templateType} has no formal pack definition.`);
  assert.equal(definition.schemaVersion, getTemplatePackSchemaVersion(templateType));
  assert.ok(definition.schemaVersion.endsWith('-v1'), `${templateType} does not expose a v1 schema.`);
  assert.ok(definition.payloadSchema, `${templateType} has no payload schema.`);
  assert.ok(Array.isArray(definition.payloadKeys), `${templateType} has no documented payload keys.`);
  versions.add(definition.schemaVersion);

  const source = fresh(templateType);
  const exported = createTemplatePack(source, templateType, false);
  assert.equal(exported.schemaVersion, definition.schemaVersion, `${templateType} export used the wrong schema version.`);
  assert.equal(exported.templateType, templateType, `${templateType} export lost template identity.`);
  assert.equal(exported.visuals, undefined, `${templateType} content export unexpectedly included visuals.`);

  const parsed = parseTemplatePack(JSON.stringify(exported), templateType);
  assert.equal(parsed.error, null, `${templateType} current export did not parse: ${parsed.error}`);
  assert.ok(parsed.data, `${templateType} current export returned no parsed data.`);
  const roundTripped = applyTemplatePackToProject(source, templateType, parsed.data);
  assert.equal(roundTripped.templateType, templateType, `${templateType} round-trip changed the active template.`);
}
assert.equal(versions.size, 12, 'Each template must have its own canonical schema version.');

{
  const wrong = parseTemplatePack(JSON.stringify({
    schemaVersion: 'match-preview-pack-v1',
    templateType: 'match-preview',
    data: { competition: 'UEFA Champions League' },
  }), 'match-result');
  assert.ok(wrong.error?.includes('active template is match-result'), 'Wrong-template import was not rejected cleanly.');
}

{
  const source = fresh('match-preview');
  const before = clone(source.templates['match-preview'].content.matchPreviewData!);
  const parsed = parseTemplatePack(JSON.stringify({
    schemaVersion: 'match-preview-pack-v1',
    templateType: 'match-preview',
    data: { competition: 'Süper Lig' },
  }), 'match-preview');
  assert.equal(parsed.error, null);
  const updated = applyTemplatePackToProject(source, 'match-preview', parsed.data);
  const after = updated.templates['match-preview'].content.matchPreviewData!;
  assert.equal(after.competition, 'Süper Lig');
  assert.deepEqual(after.team1, before.team1, 'Missing team1 fields did not preserve defaults.');
  assert.deepEqual(after.team2, before.team2, 'Missing team2 fields did not preserve defaults.');
  assert.equal(after.matchDate, before.matchDate, 'Missing matchDate did not preserve its default.');
}

{
  const invalid = parseTemplatePack(JSON.stringify({
    schemaVersion: 'match-preview-pack-v1',
    templateType: 'match-preview',
    data: { tacticalKeys: 'not-an-array' },
  }), 'match-preview');
  assert.ok(invalid.error?.startsWith('Validation failed:'), 'Invalid field type did not return a clear validation error.');
  assert.ok(invalid.error?.includes('tacticalKeys'), 'Validation error did not name the invalid field.');
}

{
  const legacyGeneric = parseTemplatePack(JSON.stringify({
    schemaVersion: 'template-pack-v1',
    templateType: 'team-profile',
    data: { teamName: 'Fenerbahçe' },
  }), 'team-profile');
  assert.equal(legacyGeneric.error, null);
  assert.ok(legacyGeneric.warnings.some((warning) => warning.includes('migrated')), 'Generic v1 migration did not produce a warning.');

  const legacyUnversioned = parseTemplatePack(JSON.stringify({
    templateType: 'thread-cover',
    headline: 'LEGACY HEADLINE',
  }), 'thread-cover');
  assert.equal(legacyUnversioned.error, null);
  assert.ok(legacyUnversioned.warnings.some((warning) => warning.includes('unversioned')), 'Unversioned migration did not produce a warning.');
}

{
  const source = fresh('transfer-graphic');
  source.templates['transfer-graphic'].visuals.playerImageSrc = 'data:image/png;base64,PLAYER-KEEP';
  source.templates['transfer-graphic'].visuals.logos = source.templates['transfer-graphic'].visuals.logos.map((logo, index) => ({
    ...logo, src: `data:image/svg+xml,TRANSFER-KEEP-${index}`, visible: true,
  }));
  const visualsBefore = clone(source.templates['transfer-graphic'].visuals);
  const parsed = parseTemplatePack(JSON.stringify({
    schemaVersion: 'transfer-graphic-pack-v1',
    templateType: 'transfer-graphic',
    data: { headline: 'CONTENT ONLY' },
  }), 'transfer-graphic');
  const updated = applyTemplatePackToProject(source, 'transfer-graphic', parsed.data);
  assert.deepEqual(updated.templates['transfer-graphic'].visuals, visualsBefore, 'Content-only Transfer import changed visuals.');
}

{
  const source = fresh('scouting-report');
  source.templates['scouting-report'].visuals.logos[0] = {
    ...source.templates['scouting-report'].visuals.logos[0],
    src: 'data:image/svg+xml,SCOUT-KEEP', visible: true,
  };
  const visualsBefore = clone(source.templates['scouting-report'].visuals);
  const parsed = parseTemplatePack(JSON.stringify({
    schemaVersion: 'player-pack-v1',
    templateType: 'scouting-report',
    player: { name: 'Visual Safe Player', club: 'Fenerbahçe' },
    scouting: { summary: 'Updated summary' },
  }), 'scouting-report');
  assert.equal(parsed.error, null);
  const updated = applyTemplatePackToProject(source, 'scouting-report', parsed.data);
  assert.deepEqual(updated.templates['scouting-report'].visuals, visualsBefore, 'Scouting import changed visuals without explicit visual instructions.');
}

for (const templateType of ['transfer-graphic', 'match-preview', 'match-analysis', 'match-result', 'team-profile'] as TemplateType[]) {
  const source = fresh(templateType);
  const slots = getTemplatePackVisualSlots(templateType);
  const sourceLogos = source.templates[templateType].visuals.logos;
  for (const [semanticKey, index] of Object.entries(slots)) {
    if (!sourceLogos[index]) continue;
    sourceLogos[index] = {
      ...sourceLogos[index],
      id: `KEEP-ID-${semanticKey}`,
      name: `KEEP-NAME-${semanticKey}`,
      src: `data:image/svg+xml,${templateType}-${semanticKey}`,
      visible: true,
      x: index * 3,
      y: index * 4,
      size: 80 + index,
      opacity: 90 - index,
    };
  }

  const exported = createTemplatePack(source, templateType, true);
  assert.ok(exported.visuals, `${templateType} explicit visual export is missing.`);
  const parsed = parseTemplatePack(JSON.stringify(exported), templateType);
  assert.equal(parsed.error, null, `${templateType} visual round-trip pack failed to parse.`);

  const target = fresh(templateType);
  const targetGeometry = target.templates[templateType].visuals.logos.map((logo) => ({
    id: logo.id, name: logo.name, x: logo.x, y: logo.y, size: logo.size, opacity: logo.opacity,
  }));
  const imported = applyTemplatePackToProject(target, templateType, parsed.data);
  const importedLogos = imported.templates[templateType].visuals.logos;

  for (const [semanticKey, index] of Object.entries(slots)) {
    if (!importedLogos[index]) continue;
    assert.equal(importedLogos[index].src, `data:image/svg+xml,${templateType}-${semanticKey}`, `${templateType}/${semanticKey} was imported into the wrong semantic slot.`);
    assert.equal(importedLogos[index].id, targetGeometry[index].id, `${templateType}/${semanticKey} visual import changed logo identity metadata.`);
    assert.equal(importedLogos[index].name, targetGeometry[index].name, `${templateType}/${semanticKey} visual import changed logo name metadata.`);
    assert.equal(importedLogos[index].x, targetGeometry[index].x, `${templateType}/${semanticKey} visual import changed logo x geometry.`);
    assert.equal(importedLogos[index].y, targetGeometry[index].y, `${templateType}/${semanticKey} visual import changed logo y geometry.`);
  }
}

{
  const parsed = parseTemplatePack(JSON.stringify({
    schemaVersion: 'transfer-graphic-pack-v1',
    templateType: 'transfer-graphic',
    data: { headline: 'SAFE' },
    visuals: { mysteryLogo: 'data:image/svg+xml,NOPE' },
  }), 'transfer-graphic');
  assert.equal(parsed.error, null);
  assert.ok(parsed.warnings.some((warning) => warning.includes('Unknown visual identity ignored: mysteryLogo')));
  const source = fresh('transfer-graphic');
  const logosBefore = clone(source.templates['transfer-graphic'].visuals.logos);
  const updated = applyTemplatePackToProject(source, 'transfer-graphic', parsed.data);
  assert.deepEqual(updated.templates['transfer-graphic'].visuals.logos, logosBefore, 'Unknown semantic visual instruction corrupted logo state.');
}

const sidebarSource = fs.readFileSync('src/components/EditorSidebar.tsx', 'utf8');
assert.match(sidebarSource, /data-testid="studio-tools-panel"/, 'Static Studio Tools panel is missing.');
assert.doesNotMatch(sidebarSource, /absolute left-3 bottom-3/, 'Old floating bottom-left tool overlay still exists.');
assert.match(sidebarSource, /data-testid="template-data-export"/, 'Current template data export control is missing.');
assert.match(sidebarSource, /downloadTemplatePack/, 'Current template data export is not wired to the pack service.');

const topBarSource = fs.readFileSync('src/components/TopBar.tsx', 'utf8');
assert.match(topBarSource, /basitbioyunLogoData/, 'Top bar does not use the BasitBiOyun logo asset.');
assert.match(topBarSource, /data-testid="studio-brand-logo"/, 'Top bar brand logo is not observable.');
assert.doesNotMatch(topBarSource, /BasitBiOyun Studio<\/h1>/, 'Old Studio text brand remains in the top bar.');
assert.doesNotMatch(topBarSource, /project\.name \|\| project\.sharedData\?\.player\?\.name/, 'Player/project name is still rendered in the top bar.');

const docsSource = fs.readFileSync('docs/TEMPLATE_JSON_PACKS.md', 'utf8');
for (const templateType of templateTypes) {
  assert.ok(docsSource.includes(getTemplatePackSchemaVersion(templateType)), `Docs do not mention ${templateType} schema version.`);
}
assert.match(docsSource, /Semantic visual identities/i, 'JSON pack docs do not document semantic visual identities.');

const packageSource = fs.readFileSync('package.json', 'utf8');
assert.match(packageSource, /"test:phase11"/, 'Phase 11 self-test is not wired into package scripts.');
const workflowSource = fs.readFileSync('.github/workflows/visual-qa.yml', 'utf8');
assert.match(workflowSource, /phase11-browser-qa\.mjs/, 'Phase 11 browser QA is not wired into Responsive Visual QA.');

console.log('Phase 11 smart data layer + sidebar UX self-test passed.');
