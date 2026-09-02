import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEFAULT_PROJECT } from '../src/constants/presets';
import {
  CURRENT_PROJECT_SCHEMA_VERSION,
  CURRENT_TEMPLATE_STATE_VERSION,
  KNOWN_GOOD_TEMPLATE_DEFAULTS,
  getTemplateVersionMetadata,
  prepareProjectForMigration,
  recoverTemplateToCurrentDefault,
  stampCurrentTemplateVersions,
} from '../src/services/templateVersioning';
import type { Project, TemplateType } from '../src/types';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const templateTypes = Object.keys(DEFAULT_PROJECT.templates) as TemplateType[];

{
  const stamped = stampCurrentTemplateVersions(clone(DEFAULT_PROJECT));
  const metadata = getTemplateVersionMetadata(stamped);
  assert.equal(metadata.projectSchemaVersion, CURRENT_PROJECT_SCHEMA_VERSION);
  for (const type of templateTypes) {
    assert.equal(metadata.templateVersions[type], CURRENT_TEMPLATE_STATE_VERSION, `${type} version metadata missing.`);
    assert.ok(KNOWN_GOOD_TEMPLATE_DEFAULTS[type][CURRENT_TEMPLATE_STATE_VERSION], `${type} known-good default missing.`);
  }
}

{
  const legacy = clone(DEFAULT_PROJECT) as any;
  delete legacy.projectSchemaVersion;
  delete legacy.templateVersions;
  legacy.templateType = 'transfer-graphic';
  legacy.templates['transfer-graphic'].visuals = {
    ...legacy.templates['transfer-graphic'].visuals,
    logos: [{ id: 'legacy-logo', name: 'Generic Legacy Logo', src: 'data:image/svg+xml,AMBIGUOUS', visible: true, x: 0, y: 0, size: 100, opacity: 100 }],
  };
  const prepared = prepareProjectForMigration(legacy);
  assert.equal(prepared.templates['transfer-graphic'].visuals.logos, undefined, 'Ambiguous single generic logo should be dropped before default merge.');
  assert.ok(prepared.migrationWarnings.some((warning: string) => warning.includes('ambiguous legacy generic logo')));
}

{
  const modern = clone(DEFAULT_PROJECT) as any;
  modern.templateType = 'match-preview';
  modern.templates['match-preview'].visuals.logos[0].src = 'data:image/svg+xml,HOME';
  modern.templates['match-preview'].visuals.logos[1].src = 'data:image/svg+xml,AWAY';
  const prepared = prepareProjectForMigration(modern);
  assert.equal(prepared.templates['match-preview'].visuals.logos[0].src, 'data:image/svg+xml,HOME');
  assert.equal(prepared.templates['match-preview'].visuals.logos[1].src, 'data:image/svg+xml,AWAY');
}

{
  const source = clone(DEFAULT_PROJECT) as Project;
  source.templateType = 'match-result';
  source.name = 'KEEP PROJECT NAME';
  source.sharedData.player.name = 'KEEP SHARED PLAYER';
  source.templates['scouting-report'].content.profile.summary = 'KEEP OTHER TEMPLATE';
  source.templates['match-result'].content.matchResultData!.matchSummary = 'BROKEN CUSTOM VALUE';
  source.templates['match-result'].visuals.logos[0].src = 'data:image/svg+xml,CUSTOM';

  const recovered = recoverTemplateToCurrentDefault(source, 'match-result');
  assert.equal(recovered.name, 'KEEP PROJECT NAME');
  assert.equal(recovered.sharedData.player.name, 'KEEP SHARED PLAYER');
  assert.equal(recovered.templates['scouting-report'].content.profile.summary, 'KEEP OTHER TEMPLATE');
  assert.deepEqual(recovered.templates['match-result'], DEFAULT_PROJECT.templates['match-result']);
  assert.equal(getTemplateVersionMetadata(recovered).templateVersions['match-result'], CURRENT_TEMPLATE_STATE_VERSION);
}

const storageSource = fs.readFileSync('src/services/storage.ts', 'utf8');
assert.match(storageSource, /prepareProjectForMigration/, 'Saved-project migration is not wired into storage.');
assert.match(storageSource, /stampCurrentTemplateVersions/, 'Version metadata is not stamped by storage.');

const docsSource = fs.readFileSync('docs/TEMPLATE_VERSIONING.md', 'utf8');
assert.match(docsSource, /ambiguous legacy generic logo/i);
assert.match(docsSource, /reset/i);

const packageSource = fs.readFileSync('package.json', 'utf8');
assert.match(packageSource, /"test:phase14"/, 'Phase 14 self-test is not wired into package scripts.');
const workflowSource = fs.readFileSync('.github/workflows/visual-qa.yml', 'utf8');
assert.match(workflowSource, /phase14-browser-qa\.mjs/, 'Phase 14 browser QA is not wired into Responsive Visual QA.');

console.log('Phase 14 template versioning & recovery self-test passed.');
