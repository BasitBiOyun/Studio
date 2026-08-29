import fs from 'node:fs';

const db = fs.readFileSync('src/services/db.ts', 'utf8');
const storage = fs.readFileSync('src/services/storage.ts', 'utf8');
const library = fs.readFileSync('src/components/ProjectLibraryModal.tsx', 'utf8');
const modal = fs.readFileSync('src/components/ProjectVersionsModal.tsx', 'utf8');

function requireText(source: string, needle: string, message: string) {
  if (!source.includes(needle)) throw new Error(`Version history self-test failed: ${message}`);
}

requireText(db, 'this.version(2).stores', 'Dexie migration v2 is missing');
requireText(db, "projectVersions: 'id, projectId, createdAt, [projectId+createdAt]'", 'version history indexes are missing');
requireText(storage, 'const MAX_PROJECT_VERSIONS = 10', 'history must remain bounded to ten versions');
requireText(storage, 'snapshotProjectIfNeeded', 'save path must snapshot the previous state');
requireText(storage, 'projectFingerprint', 'duplicate saves must be deduplicated');
requireText(storage, 'listProjectVersions', 'version listing API is missing');
requireText(storage, 'restoreProjectVersion', 'version restore API is missing');
requireText(storage, "db.projectVersions.where('projectId').equals(id).delete()", 'deleting a project must delete its snapshots');
requireText(library, '<ProjectVersionsModal', 'project library must expose version history');
requireText(library, 'Versions', 'project library version action is missing');
requireText(modal, 'current state will be kept in history', 'restore must warn that current state is preserved');

console.log('Version history self-test passed: local snapshots are bounded, deduplicated, restorable and cleaned with projects.');
