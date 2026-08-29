export interface DataPackMigrationResult {
  value: unknown;
  migratedFrom?: string;
}

/**
 * Central migration entry point for importable content packs.
 * v1 is the current canonical format. Legacy unversioned player packs are
 * upgraded without touching visual project state.
 */
export function migrateImportPack(input: unknown): DataPackMigrationResult {
  if (!input || typeof input !== 'object') return { value: input };

  const raw = { ...(input as Record<string, any>) };

  if (raw.schemaVersion === 'player-pack-v1' || raw.schemaVersion === 'studio-pack-v1') {
    return { value: raw };
  }

  // Legacy Player Pack: old builds accepted the same top-level player/stats
  // fields but schemaVersion could be omitted.
  if (!raw.schemaVersion && raw.player && typeof raw.player === 'object') {
    return {
      value: {
        ...raw,
        schemaVersion: 'player-pack-v1',
      },
      migratedFrom: 'unversioned-player-pack',
    };
  }

  if (raw.schemaVersion === 'player-pack-v0') {
    const scouting = raw.scouting || {
      summary: raw.scoutingSummary,
      tacticalProfile: raw.tacticalProfile,
      strengths: raw.strengths,
      development: raw.developmentAreas,
    };

    return {
      value: {
        ...raw,
        schemaVersion: 'player-pack-v1',
        scouting,
      },
      migratedFrom: 'player-pack-v0',
    };
  }

  return { value: raw };
}
