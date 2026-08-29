import assert from 'node:assert/strict';
import { migrateImportPack } from '../src/services/dataPackMigrations';
import { parsePlayerPack } from '../src/services/playerPack';

const legacyUnversioned = {
  player: { name: 'Legacy Player', nationality: 'Turkey' },
  stats: [{ label: 'Shots /90', value: 2.5 }],
  scoutingSummary: 'Legacy summary',
};

const migratedUnversioned: any = migrateImportPack(legacyUnversioned);
assert.equal((migratedUnversioned.value as any).schemaVersion, 'player-pack-v1');
assert.equal(migratedUnversioned.migratedFrom, 'unversioned-player-pack');
const parsedUnversioned = parsePlayerPack(JSON.stringify(legacyUnversioned));
assert.equal(parsedUnversioned.error, null, `Unversioned Player Pack should migrate: ${parsedUnversioned.error}`);
assert.ok(parsedUnversioned.unknownKeys.includes('migrated:unversioned-player-pack'));

const legacyV0 = {
  schemaVersion: 'player-pack-v0',
  player: { name: 'V0 Player' },
  scoutingSummary: 'V0 summary',
  tacticalProfile: 'V0 tactical profile',
  strengths: ['Strength'],
  developmentAreas: ['Development'],
};

const migratedV0: any = migrateImportPack(legacyV0);
assert.equal((migratedV0.value as any).schemaVersion, 'player-pack-v1');
assert.equal((migratedV0.value as any).scouting.summary, 'V0 summary');
assert.equal(migratedV0.migratedFrom, 'player-pack-v0');
const parsedV0 = parsePlayerPack(JSON.stringify(legacyV0));
assert.equal(parsedV0.error, null, `Player Pack v0 should migrate: ${parsedV0.error}`);
assert.ok(parsedV0.unknownKeys.includes('migrated:player-pack-v0'));

console.log('Data pack migration self-test passed: unversioned Player Pack + player-pack-v0 -> player-pack-v1.');
