import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEFAULT_PROJECT, TEMPLATE_METADATA } from '../src/constants/presets';
import type { AssetKind, AssetLibraryRecord } from '../src/services/db';
import { ASSET_KINDS, hashAssetData } from '../src/services/assetLibraryModel';
import { applyAssetToProject, getAssetTargets } from '../src/services/assetTargets';
import { Project } from '../src/types';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const requiredKinds: AssetKind[] = ['player-cutout', 'club-logo', 'competition-logo', 'custom-image'];
assert.deepEqual(ASSET_KINDS, requiredKinds, 'Phase 7 asset kinds changed.');

const hashA1 = await hashAssetData('data:image/svg+xml;base64,AAA');
const hashA2 = await hashAssetData('data:image/svg+xml;base64,AAA');
const hashB = await hashAssetData('data:image/svg+xml;base64,BBB');
assert.equal(hashA1, hashA2, 'Equal asset data must produce the same hash.');
assert.notEqual(hashA1, hashB, 'Different asset data should not produce the same hash in the smoke test.');

for (const template of TEMPLATE_METADATA) {
  for (const kind of requiredKinds) {
    const base = clone(DEFAULT_PROJECT) as Project;
    base.templateType = template.type;
    const activeBefore = base.templates[template.type];
    activeBefore.content.profile.summary = `KEEP CONTENT ${template.type}`;
    activeBefore.visuals.playerImageSrc = `KEEP-PRIMARY-${template.type}`;
    activeBefore.visuals.secondaryPlayerImageSrc = `KEEP-SECONDARY-${template.type}`;
    activeBefore.visuals.logos = activeBefore.visuals.logos.map((logo, index) => ({
      ...logo,
      id: `${template.type}-slot-${index}`,
      name: `semantic-${index}`,
      src: `KEEP-LOGO-${template.type}-${index}`,
      visible: index !== 2,
    }));

    const contentSnapshot = clone(activeBefore.content);
    const sharedSnapshot = clone(base.sharedData);
    const inactiveSnapshot = Object.fromEntries(
      Object.entries(base.templates)
        .filter(([key]) => key !== template.type)
        .map(([key, value]) => [key, clone(value)]),
    );

    const asset: AssetLibraryRecord = {
      id: `asset-phase7-${template.type}-${kind}`,
      name: `Phase 7 ${kind}`,
      kind,
      dataUrl: `data:image/svg+xml;base64,PHASE7-${template.type}-${kind}`,
      mimeType: 'image/svg+xml',
      hash: `hash-${template.type}-${kind}`,
      createdAt: 1,
      updatedAt: 1,
    };

    const targets = getAssetTargets(base, kind);
    for (const target of targets) {
      const applied = applyAssetToProject(base, asset, target.key);
      const activeAfter = applied.templates[template.type];

      assert.deepEqual(activeAfter.content, contentSnapshot, `${kind} changed ${template.type} content.`);
      assert.deepEqual(applied.sharedData, sharedSnapshot, `${kind} changed shared project data.`);
      for (const [key, snapshot] of Object.entries(inactiveSnapshot)) {
        assert.deepEqual((applied.templates as any)[key], snapshot, `${kind} changed inactive template ${key}.`);
      }

      if (target.key === 'primary-image') {
        assert.equal(activeAfter.visuals.playerImageSrc, asset.dataUrl, 'Primary image target was not updated.');
        assert.equal(activeAfter.visuals.secondaryPlayerImageSrc, activeBefore.visuals.secondaryPlayerImageSrc, 'Primary image apply changed secondary image.');
        assert.deepEqual(activeAfter.visuals.logos, activeBefore.visuals.logos, 'Primary image apply changed logos.');
      } else if (target.key === 'secondary-image') {
        assert.equal(activeAfter.visuals.secondaryPlayerImageSrc, asset.dataUrl, 'Secondary image target was not updated.');
        assert.equal(activeAfter.visuals.playerImageSrc, activeBefore.visuals.playerImageSrc, 'Secondary image apply changed primary image.');
        assert.deepEqual(activeAfter.visuals.logos, activeBefore.visuals.logos, 'Secondary image apply changed logos.');
      } else {
        const logoIndex = Number(target.key.replace('logo-', ''));
        assert.equal(activeAfter.visuals.logos[logoIndex].src, asset.dataUrl, `${target.label} did not receive asset.`);
        assert.equal(activeAfter.visuals.logos[logoIndex].visible, true, `${target.label} was not made visible.`);
        activeAfter.visuals.logos.forEach((logo, index) => {
          if (index === logoIndex) return;
          assert.deepEqual(logo, activeBefore.visuals.logos[index], `${target.label} overwrote semantic sibling slot ${index}.`);
        });
      }

      assert.equal(JSON.stringify(applied).includes(asset.id), false, 'Project should copy asset data, not depend on library record id.');
    }
  }
}

const transfer = clone(DEFAULT_PROJECT) as Project;
transfer.templateType = 'transfer-graphic';
const transferClubTargets = getAssetTargets(transfer, 'club-logo');
assert.deepEqual(transferClubTargets.map((target) => target.label), ['From Club Logo', 'To Club Logo']);
assert.equal(getAssetTargets(transfer, 'competition-logo')[0]?.label, 'Competition Logo');

const comparison = clone(DEFAULT_PROJECT) as Project;
comparison.templateType = 'player-comparison';
assert.deepEqual(getAssetTargets(comparison, 'player-cutout').map((target) => target.label), ['Player 1 Photo', 'Player 2 Photo']);

const teamProfile = clone(DEFAULT_PROJECT) as Project;
teamProfile.templateType = 'team-profile';
assert.equal(getAssetTargets(teamProfile, 'player-cutout').length, 0, 'Team Profile must not invent a player-image slot.');
assert.equal(getAssetTargets(teamProfile, 'club-logo')[0]?.label, 'Team Logo / Background Crest');
assert.equal(getAssetTargets(teamProfile, 'competition-logo')[0]?.label, 'League / Competition Logo');

const dbSource = fs.readFileSync('src/services/db.ts', 'utf8');
assert.match(dbSource, /this\.version\(3\)/, 'IndexedDB schema was not upgraded for Phase 7.');
assert.match(dbSource, /assets:\s*'id, kind, name, hash, updatedAt, \[kind\+hash\]'/, 'Asset IndexedDB indexes are missing.');

const librarySource = fs.readFileSync('src/services/assetLibrary.ts', 'utf8');
assert.match(librarySource, /\[kind\+hash\]/, 'Duplicate hash index is not used.');
assert.match(librarySource, /db\.assets\.delete/, 'Asset removal is missing.');
assert.match(librarySource, /db\.assets\.update/, 'Asset rename is missing.');
assert.doesNotMatch(librarySource, /fetch\s*\(/, 'Asset library must not require a backend fetch.');

const modalSource = fs.readFileSync('src/components/AssetLibraryModal.tsx', 'utf8');
assert.match(modalSource, /asset-library-search/, 'Thumbnail browser search UI is missing.');
assert.match(modalSource, /multiple/, 'Multi-file add UI is missing.');
assert.match(modalSource, /getAssetTargets/, 'Asset UI is not semantic-slot aware.');
assert.match(modalSource, /applyAssetToProject/, 'Asset UI does not apply through project state.');

console.log('Phase 7 asset library self-test passed.');
