import type { TemplateType } from '../types';

export interface DataPackMigrationResult {
  value: unknown;
  migratedFrom?: string;
}

export interface TemplatePackEnvelopeMigrationResult {
  value: Record<string, any>;
  migratedFrom?: string;
  warning?: string;
  error?: string;
}

const TEMPLATE_TYPES = new Set<TemplateType>([
  'scouting-report',
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
]);

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

/**
 * Migrates legacy non-scouting template envelopes to the canonical per-template
 * v1 schema. A declared template identity is never silently changed.
 */
export function migrateTemplatePackEnvelope(
  input: unknown,
  activeTemplateType: TemplateType,
  expectedSchemaVersion: string,
): TemplatePackEnvelopeMigrationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { value: {}, error: 'JSON must contain an object.' };
  }

  const raw = { ...(input as Record<string, any>) };
  const declaredFromType = TEMPLATE_TYPES.has(raw.type as TemplateType) ? raw.type : undefined;
  const declaredType = raw.templateType || declaredFromType;

  if (declaredType && declaredType !== activeTemplateType) {
    return {
      value: raw,
      error: `This JSON is for ${declaredType}, but the active template is ${activeTemplateType}.`,
    };
  }

  let migratedFrom: string | undefined;
  let warning: string | undefined;

  if (!raw.schemaVersion) {
    migratedFrom = 'unversioned-template-pack';
    warning = `Legacy unversioned pack migrated to ${expectedSchemaVersion}.`;
    raw.schemaVersion = expectedSchemaVersion;
  } else if (raw.schemaVersion === 'template-pack-v1') {
    migratedFrom = 'template-pack-v1';
    warning = `Generic template-pack-v1 migrated to ${expectedSchemaVersion}.`;
    raw.schemaVersion = expectedSchemaVersion;
  } else if (raw.schemaVersion === expectedSchemaVersion.replace(/-v1$/, '-v0')) {
    migratedFrom = raw.schemaVersion;
    warning = `${raw.schemaVersion} migrated to ${expectedSchemaVersion}.`;
    raw.schemaVersion = expectedSchemaVersion;
  }

  if (!raw.templateType) raw.templateType = activeTemplateType;

  return { value: raw, migratedFrom, warning };
}
